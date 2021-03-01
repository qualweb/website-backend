import {
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import puppeteer from 'puppeteer';
import { Dom } from '@qualweb/dom';
import { Evaluation } from '@qualweb/evaluation';
import { QualwebOptions } from '@qualweb/core';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  browser: puppeteer.Browser | null = null;

  constructor() {
    puppeteer.launch().then((browser) => (this.browser = browser));
  }

  async handleConnection(): Promise<void> {
    return;
  }

  async handleDisconnect(): Promise<void> {
    return;
  }

  @SubscribeMessage('evaluate')
  async startEvaluation(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const url = decodeURIComponent(data.url);

    const dom = new Dom();
    try {
      const options: QualwebOptions = {
        execute: {
          act: !!data.modules['act'],
          wcag: !!data.modules['wcag'],
        },
      };
      const { sourceHtml, page, validation } = await dom.getDOM(
        this.browser,
        options,
        url,
        '',
      );
      const evaluation = new Evaluation();
      const evaluator = await evaluation.getEvaluator(page, sourceHtml, url);
      evaluator.page.dom.source.html.parsed = [];
      client.emit('evaluator', evaluator);

      await evaluation.addQWPage(page);

      if (data.modules['act']) {
        client.emit('moduleStart', 'act-rules');
        const actReport = await evaluation.executeACT(page, sourceHtml, {});
        client.emit('moduleEnd', { module: 'act-rules', report: actReport });
      }

      if (data.modules['wcag']) {
        client.emit('moduleStart', 'wcag-techniques');
        // @ts-ignore
        const htmlReport = await evaluation.executeWCAG(page, {}, validation);
        client.emit('moduleEnd', {
          module: 'wcag-techniques',
          report: htmlReport,
        });
      }

      client.emit('prepare-data', true);

      client.emit('evaluationEnd', true);

      await page.close();
    } catch (err) {
      console.error(err);
      client.emit('errorHandle', err.toString());
    } finally {
      await dom.close();
    }
  }
}
