/**
 *
 * @author 
 *
 */
class GodRay {
    private _view3D: egret3d.View3D;
    private _viewPort: egret3d.Rectangle;
    private _cameraController: egret3d.HoverController;
    
    private _sun : egret3d.Mesh;
    private _sunPos : egret3d.Vector3D = new egret3d.Vector3D();
    private _RTTSun : RTTSun;
    private _CoverMat: egret3d.TextureMaterial;
    private _CoverTex: egret3d.TextureBase;
    private _Quad: Quad;
    
	public constructor() {
        this._viewPort = new egret3d.Rectangle(0,0,1024,768);
        egret3d.Egret3DDrive.requstContext3D(DeviceUtil.getGPUMode,this._viewPort,() => this.init3D());
	}
	
    private init3D() {
        egret3d.CheckerboardTexture.texture.upload(egret3d.Egret3DDrive.context3D);
        this._view3D = new egret3d.View3D(this._viewPort);
        this._view3D.camera3D.position = new egret3d.Vector3D(0,5,-10);
        //this._view3D.backImageTexture = egret3d.CheckerboardTexture.texture;
        egret3d.AssetsManager.getInstance().setRootURL("resource/");
        egret3d.AssetsManager.getInstance().addLoadTexture("godray/cover.png");
        egret3d.AssetsManager.getInstance().addLoadTexture("godray/sun.png");
        egret3d.AssetsManager.getInstance().addLoadTexture("360photo/2.JPG");
        egret3d.AssetsManager.getInstance().addEventListener(egret3d.Event3D.EVENT_LOAD_COMPLETE,(e: egret3d.Event3D) => this.initScene(e));
        egret3d.AssetsManager.getInstance().startLoad();
    }
    
    private initScene(e) {

        //this._CoverTex = egret3d.AssetsManager.getInstance().findTexture("godray/cover.png");
        //this._CoverMat = new egret3d.TextureMaterial(this._CoverTex);
        //this._CoverMat.diffuseColor = 0xFF0000;
        //var testMat = new ColorMaterial(this._CoverTex);
        //var sunTex: egret3d.TextureBase = egret3d.AssetsManager.getInstance().findTexture("godray/sun.png");
        //var sunMat: egret3d.TextureMaterial = new egret3d.TextureMaterial(sunTex);
        
        //this._sun = new egret3d.Mesh(new egret3d.PlaneGeometry(),sunMat);
        //this._sunPos.z = 201;
        //this._sun.position = this._sunPos;
        //this._sun.rotationX = -90;
        
        //this._view3D.addChild3D(this._sun);
        
        //var mesh: egret3d.Mesh = new egret3d.Mesh(new egret3d.PlaneGeometry(), testMat);
        ////var mesh: egret3d.Mesh = new egret3d.Mesh(new egret3d.PlaneGeometry(), this._CoverMat);
        //mesh.position.z = 200;
        //mesh.rotationX = -90;
        
        //this._view3D.addChild3D(mesh);

        this._Quad = new Quad(this._view3D);
        //this._Quad.position.z = 1;
        this._Quad.position.y = 5;
        //this._Quad.scale = new egret3d.Vector3D(9, 9, 9);
        //this._Quad.setTex(sunTex);
        //this._Quad.setMaskTex(this._CoverTex);
        //this._RTTSun = new RTTSun(new egret.Rectangle(0, 0, 512, 512), this._view3D);

        //this._cameraController = new egret3d.HoverController(this._view3D.camera3D);
        window.requestAnimationFrame(() => this.update());
    }
    
    private time: number = 0;
    private timeDate: Date;
    private delay: number = 0;
    private update() {

        this.timeDate = new Date();

        this.delay = this.timeDate.getTime() - this.time;

        this.time = this.timeDate.getTime();

        this._view3D.renden(this.time,this.delay);
        this._Quad.draw(this.time, this.delay);

        window.requestAnimationFrame(() => this.update());
    }
}
