import Player from './Player.js';
import DialogManager from './DialogManager.js';
import NPC from './NPC.js';
import House from './House.js';

class World extends Phaser.Scene{
    constructor(){
        super({key:'World'});

        this.player=null;
        this.elder=null;
        this.cursors=null;
        this.readyTalking=false;
        this.isWraping=false;
    }
    preload(){
        this.load.image('sky','assets/sky.png');
        this.load.image('player','assets/player.png');
        this.load.tilemapTiledJSON('map','assets/map.tmj');
        this.load.json('myDialogs','assets/data/dialog.json');
        this.load.image('tileset','pipo-map001/640x480/pipo-map001.png');
    }
    create(){
    //-------------------------------------------------------マップ---------------------------------------------------------------------------------
        const map = this.make.tilemap({ key: 'map' });
    
        const tileset = map.addTilesetImage('pipo-map001','tileset');
        
        this.backgroundLayer = map.createLayer('ground', tileset, 0, 0); 
        this.worldLayer = map.createLayer('object', tileset, 0, 0); 
        this.worldLayer.setCollisionByProperty({ collides: true });
    //----------------------------------------------------------キー------------------------------------------------------------------------------
        this.cursors=this.input.keyboard.createCursorKeys();
    //----------------------------------------------------------プレイヤー------------------------------------------------------------------------------
        this.player=new Player(this,100,300,'player');
    //--------------------------------------------------------NPC-------------------------------------------------------------
        this.elder=new NPC(this,800,300,'player');
    //----------------------------------------------------------当たり判定-----------------------------------------------------------------------
        this.physics.add.collider(this.player,this.worldLayer);
        this.physics.add.collider(this.elder,this.worldLayer);
        this.physics.add.collider(this.player,this.elder);
    //-------------------------------------------------------------ログ--------------------------------------------------------------------------
        this.dialogManager=new DialogManager();

        const allData=this.cache.json.get('myDialogs');

        const ch1Opening=allData.chapter1.opening;
        this.readyTalking=false;

        this.input.keyboard.on('keydown-SPACE',()=>{
            if(!this.dialogManager.isTalking && this.readyTalking){
                this.dialogManager.start(ch1Opening);
                this.elder.showIcon(true);
            }else if(this.dialogManager.isTalking){
                this.dialogManager.showLine();
            }
        });
        
        //this.cameras.main.startFollow(this.player);
        //this.cameras.main.setBounds(0,0,1000,1000);
    }
    update(time,delta){
        this.player.update();
        this.elder.update(time, delta);

        const tile=this.worldLayer.getTileAtWorldXY(this.player.x,this.player.y);
        if(tile.index===99){
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('House');
            });
        }


        const distance=Phaser.Math.Distance.Between(
            this.player.x,this.player.y,
            this.elder.x,this.elder.y
        );
        if(distance<100 && !this.dialogManager.isTalking){
            this.readyTalking=true;
            this.elder.showIcon(true);
        }else{
            this.readyTalking=false;
            this.elder.showIcon(false);
        }
    }
}

const config={
    type:Phaser.AUTO,
    width:1600,
    height:1600,
    parent:'game-container',
    dom:{
        createContainer:true
    },
    physics:{
        default:'arcade',
        arcade:{
            gravity:{y:0},
            debug:true
        }
    },
    scene:[World,House]
}

const game=new Phaser.Game(config);