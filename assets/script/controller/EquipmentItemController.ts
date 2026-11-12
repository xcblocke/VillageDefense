import { _decorator, color, instantiate, Label, Node } from 'cc';
import { EquipmentConfig } from '../../config/EquipmentConfig';
import { EquipmentGradeConfig } from '../../config/EquipmentGradeConfig';
import { EquipmentGrades } from '../config/IConfig';
import { MsgMgr } from '../dlspace/common/MsgMgr';
import { Controller } from '../dlspace/components/Controller';
import { UISprite } from '../dlspace/components/UISprite';
import { Core } from '../global/Core';
import { GameAction } from '../global/IGame';
import { IUserEquipmentData } from '../global/UserInfo';
import { getEquipmentFrame, getEquipmentTypeIco, loadSpriteFrame } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

const gradeColors = [color('FFFFFF'), color('FAA3A6'), color('FCF1AD'), color('EEBEFF')];

@ccclass('EquipmentItemController')
export class EquipmentItemController extends Controller {

    @property(UISprite)
    frame: UISprite;

    @property(UISprite)
    ico: UISprite;

    @property(UISprite)
    typeIco: UISprite;

    @property(Label)
    level: Label;

    @property(Label)
    grade: Label;

    @property(Node)
    stars: Node;

    @property(Label)
    title: Label;

    private _currentUid: string;

    init(data: IUserEquipmentData) {
        this._currentUid = data.uid;
        let config = EquipmentConfig.where('id', data.id);
        let gradeConfig = EquipmentGradeConfig.where('grade', data.grade);

        loadSpriteFrame(this.frame, getEquipmentFrame(data.grade));
        loadSpriteFrame(this.ico, `texture/equipment/${config.ico}`);
        loadSpriteFrame(this.typeIco, getEquipmentTypeIco(config.type));
        if (gradeConfig.maxLevel === data.level) {
            this.level.string = `Lv.Max`;
        }
        else {
            this.level.string = `Lv.${data.level}`;
        }
        this.grade.color = gradeColors[EquipmentGrades.indexOf(data.grade)];
        this.grade.string = data.grade;
        let hasStar = data.star > 0;
        this.stars.active = hasStar;
        if (hasStar) {
            let stars = this.stars.children;
            let forCount = Math.max(stars.length, data.star);
            for (let i = 0; i < forCount; ++i) {
                let node = stars[i];
                if (!node) {
                    let cloneNode = stars[0];
                    node = instantiate(cloneNode);
                    node.parent = cloneNode.parent;
                }
                node.active = i < data.star;
            }
        }
        this.title.string = config.name;
    }

    protected onEnable(): void {
        MsgMgr.on(GameAction.onEquipmentUpgrade, this._onEquipmentUpgrade, this);
    }

    protected onDisable(): void {
        MsgMgr.off(GameAction.onEquipmentUpgrade, this._onEquipmentUpgrade, this);
    }

    private _onEquipmentUpgrade(uid: string) {
        if (this._currentUid !== uid) return;
        let item = Core.userInfo.equipments.find(v => v.uid === uid);
        item && this.init(item);
    }

}


