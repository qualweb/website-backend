"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const act_rules_1 = require("@qualweb/act-rules");
const wcag_techniques_1 = require("@qualweb/wcag-techniques");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    async evaluateUrl(req) {
        try {
            const modules = [];
            if (req.body?.act)
                modules.push(new act_rules_1.ACTRules());
            if (req.body?.wcag)
                modules.push(new wcag_techniques_1.WCAGTechniques());
            const options = {
                url: decodeURIComponent(req.body.url),
                waitUntil: ['load', 'networkidle0'],
                modules
            };
            const report = await this.appService.evaluate(options);
            return { status: 1, message: 'Evaluation done successfully.', report };
        }
        catch (err) {
            console.error(err);
            return { status: 2, message: 'An error has ocurred while evaluating.' };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)('url'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "evaluateUrl", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('app'),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map