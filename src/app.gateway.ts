import { WebSocketServer, ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as puppeteer from 'puppeteer';
import { randomBytes } from 'crypto';
import { getDom } from './getDom';
import { ACTRules } from '@qualweb/act-rules';
import { HTMLTechniques } from '@qualweb/html-techniques';
import { CSSTechniques } from '@qualweb/css-techniques';
import { BestPractices } from '@qualweb/best-practices';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  browser: puppeteer.Browser | null = null;;

  constructor() {
    this.init();
  }

  private async init() {
    this.browser = await puppeteer.launch(
      {
        ignoreHTTPSErrors: true,
        headless: true,
        args: ['--no-sandbox']
      }
    );
  } 

  async handleConnection(){
    
  }

  async handleDisconnect(){
    
  }

  private parseUrl(url: string, pageUrl: string): any {
    const inputUrl = url;
    const completeUrl = pageUrl;
  
    const protocol = completeUrl.split('://')[0];
    const domainName = completeUrl.split('/')[2];
  
    const tmp = domainName.split('.');
    const domain = tmp[tmp.length-1];
    const uri = completeUrl.split('.' + domain)[1];
  
    const parsedUrl = {
      inputUrl,
      protocol,
      domainName,
      domain,
      uri,
      completeUrl
    };
  
    return parsedUrl;
  }

  private normalizeUrl(url: string): string {
    return url.startsWith('http') ? url : 'http://' + url;
  }

  @SubscribeMessage('evaluate')
  async startEvaluation(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    //const url = this.normalizeUrl(decodeURIComponent(data.url));
    const url = decodeURIComponent(data.url);

    try {
      const { sourceHtml, page, stylesheets, mappedDOM } = await getDom(this.browser, url);
      const [pageUrl, plainHtml, pageTitle, elements, browserUserAgent] = await Promise.all([
        page.url(),
        page.evaluate(() => {
          return document.documentElement.outerHTML;
        }),
        page.title(),
        page.$$('*'),
        page.browser().userAgent()
      ]);
    
      const processedHtml = {
        html: {
          plain: plainHtml
        },
        title: pageTitle,
        elementCount: elements.length
      };
    
      const viewport = page.viewport();
    
      const evaluator = {
        name: 'QualWeb',
        description: 'QualWeb is an automatic accessibility evaluator for webpages.',
        version: '3.0.0',
        homepage: 'http://www.qualweb.di.fc.ul.pt/',
        date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        hash: randomBytes(40).toString('hex'),
        url: this.parseUrl(url, pageUrl),
        page: {
          viewport: {
            mobile: viewport.isMobile,
            landscape: viewport.isLandscape,
            userAgent: browserUserAgent,
            resolution: {
              width: viewport.width,
              height: viewport.height
            }
          },
          dom: {
            source: sourceHtml,
            processed: processedHtml,
            stylesheets
          }
        }
      };

      const parsed = evaluator.page.dom.source.html.parsed;
      delete evaluator.page.dom.source.html.parsed;
      delete evaluator.page.dom.stylesheets;

      client.emit('evaluator', evaluator);

      evaluator.page.dom.source.html.parsed = parsed;
      evaluator.page.dom.stylesheets = stylesheets;

      if(data.modules['act']) {
        client.emit('moduleStart', 'act-rules');
        const act = new ACTRules();
        const actReport = await act.execute(sourceHtml, page, stylesheets);
        client.emit('moduleEnd', {module: 'act-rules', report: actReport});
      }

      if(data.modules['html']) {
        client.emit('moduleStart', 'html-techniques');
        const html = new HTMLTechniques();
        const htmlReport = await html.execute(page);
        client.emit('moduleEnd', {module: 'html-techniques', report: htmlReport});
      }

      if(data.modules['css']) {
        client.emit('moduleStart', 'css-techniques');
        const css = new CSSTechniques();
        const cssReport = await css.execute(stylesheets, mappedDOM);
        client.emit('moduleEnd', {module: 'css-techniques', report: cssReport});
      }

      if(data.modules['bp']) {
        client.emit('moduleStart', 'best-practices');
        const bp = new BestPractices();
        const bpReport = await bp.execute(page, stylesheets);
        client.emit('moduleEnd', {module: 'best-practices', report: bpReport});
      }

      client.emit('prepare-data', true);

      client.emit('evaluationEnd', true);

      await page.close();
    } catch (err) {
      console.error(err);
      client.emit('errorHandle', err.toString());
    }
  }
}
