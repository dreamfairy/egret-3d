class RTTBase {
    protected _collect: egret3d.EntityCollect;
    protected _renderList;
    protected _usage: egret3d.MethodUsageData;

    public constructor() {
        this._collect = new egret3d.EntityCollect(null);
        this._renderList = this._collect.renderList;
        this._usage = new egret3d.MethodUsageData();
    }

    protected addToRenderList(target: egret3d.Mesh) {

        var idx = this._renderList.indexOf(target);
        if (idx == -1) {
            this._renderList.push(target);
        }
    }

    protected removeFromRenderList(target: egret3d.Mesh) {
        var idx = this._renderList.indexOf(target);
        if (idx != -1) {
            this._renderList.splice(idx, 1);
        }
    }

    protected createProgram(context3D: egret3d.Context3D) {

    }

    protected handleBeforeDraw(context3D: egret3d.Context3D) {
       
    }

    protected handleAfterDraw(context3D: egret3d.Context3D) {
    }

    public draw(time, delay, view: egret3d.View3D, source: egret3d.FrameBuffer) {
        this.handleBeforeDraw(view.context3D);

        this.handleAfterDraw(view.context3D);
    }

    public getCollect(): any {
        return this._collect;
    }

    public destroy() {
        this._renderList = null;
        this._collect = null;
        this._usage.dispose();
        this._usage = null;
    }
}