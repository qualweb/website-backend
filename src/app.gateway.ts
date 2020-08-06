import { WebSocketServer, ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as puppeteer from 'puppeteer';
import { Dom } from '@qualweb/dom';
import { Evaluation } from '@qualweb/evaluation';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  browser: puppeteer.Browser | null = null;
  htmlTechniques: string[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    this.browser = await puppeteer.launch();

    let noHtml = [12, 18, 20, 21, 31, 35, 36];
    for (let i = 1; i <= 43; i++) {
      if (!noHtml.includes(i)) {
        this.htmlTechniques.push('QW-HTML-T'.concat(i.toString()));
      }
    }

  }

  async handleConnection() {

  }

  async handleDisconnect() {

  }

  private normalizeUrl(url: string): string {
    return url.startsWith('http') ? url : 'http://' + url;
  }

  @SubscribeMessage('evaluate')
  async startEvaluation(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    //const url = this.normalizeUrl(decodeURIComponent(data.url));
    const url = decodeURIComponent(data.url);

    try {
      let dom = new Dom();
      let { sourceHtml, page } = await dom.getDOM(this.browser, {}, url, "");
      let evaluation = new Evaluation();
      let evaluator = await evaluation.getEvaluator(page, sourceHtml, [], url);
      evaluator.page.dom.processed = [];
      evaluator.page.dom.stylesheets = [];
      evaluator.page.dom.source.html.parsed = [];
      client.emit('evaluator', evaluator);

      await evaluation.addQWPage(page);

      if (data.modules['act']) {
        client.emit('moduleStart', 'act-rules');
        let actReport = await evaluation.executeACT(page, sourceHtml, [], {});
        client.emit('moduleEnd', { module: 'act-rules', report: actReport });
      }

      if (data.modules['html']) {
        client.emit('moduleStart', 'html-techniques');
        // @ts-ignore
        let htmlReport = await evaluation.executeHTML(page, { techniques: this.htmlTechniques });
        client.emit('moduleEnd', { module: 'html-techniques', report: htmlReport });
      }

      if (data.modules['css']) {
        client.emit('moduleStart', 'css-techniques');
        let cssReport = await evaluation.executeCSS(page, [], [], {});
        client.emit('moduleEnd', { module: 'css-techniques', report: cssReport });
      }

      /*if (data.modules['bp']) {
        client.emit('moduleStart', 'best-practices');
        let bpReport = await evaluation.executeBP(page, {});
        client.emit('moduleEnd', { module: 'best-practices', report: bpReport });
      }*/

      client.emit('prepare-data', true);

      client.emit('evaluationEnd', true);

      await page.close();
    } catch (err) {
      console.error(err);
      client.emit('errorHandle', err.toString());
    }
  }
}
