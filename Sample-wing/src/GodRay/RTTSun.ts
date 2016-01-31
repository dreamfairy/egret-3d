/**
 *
 * @author 
 *
 */
class RTTSun extends RTTBase {
    private _sun: egret3d.Mesh;
    private _sunMat: egret3d.TextureMaterial;
    private _sunPos: egret3d.Vector3D;
    public constructor() {
        super();
        var sunTex: egret3d.TextureBase = egret3d.AssetsManager.getInstance().findTexture("godray/sun.png");
        this._sunMat = new egret3d.TextureMaterial(sunTex);
        this._sun = new egret3d.Mesh(new egret3d.PlaneGeometry(), this._sunMat);

        this._sunPos = new egret3d.Vector3D(0, 0, 200);
        this._sun.position = this._sunPos;
        this._sun.rotationX = -90;

        this.addToRenderList(this._sun);
    }

    public draw(time, delay, view: egret3d.View3D, source: egret3d.FrameBuffer) {
        this.handleBeforeDraw(view.context3D);

        this._sunPos.x = Math.sin(time / 1000) * 50;
        this._sunPos.y = Math.cos(time / 1000) * 50;
        this._sun.position = this._sunPos;

        this.handleAfterDraw(view.context3D);
    }

    public getSunPos(): egret3d.Vector3D {
        return this._sunPos;
    }
}
