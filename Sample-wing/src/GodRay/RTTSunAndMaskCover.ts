/**
 *
 * @author 
 *
 */
class RTTSunAndMaskCover extends RTTBase {
    private _mask: egret3d.Mesh;
    private _maskMat: egret3d.TextureMaterial;
    private _quadData: QuadData;

    private _numSampler: number = 30;
    private _density: number = 0.1;
    private _densityScale: number = this._numSampler * this._density;
    private _weight: number = 3.50;
    private _decay: number = 0.8;
    private _exposure: number = 0.55;
    private _screenLightPos: egret3d.Vector3D = new egret3d.Vector3D();


    private _uvCenterPos = [0.5, 0.5, 1, 1];
    private _godRayParam = [this._numSampler, this._density, this._densityScale, 1 / this._numSampler];
    private _godRayParam2 = [this._weight, this._decay, this._exposure, 0];

    public constructor() {
        super();

        var maskTex: egret3d.TextureBase = egret3d.AssetsManager.getInstance().findTexture("godray/cover.png");
        this._maskMat = new ColorMaterial(maskTex, new egret3d.Color(0, 0, 0, 1));
        this._mask = new egret3d.Mesh(new egret3d.PlaneGeometry(), this._maskMat);
        this._mask.position.z = 199;
        this._mask.rotationX = -90;

        this.addToRenderList(this._mask);
    }

    protected createProgram(context3D: egret3d.Context3D) {
        var vsShader = new egret3d.GLSL.ShaderBase(null, this._usage);
        var fsShader = new egret3d.GLSL.ShaderBase(null, this._usage);
        vsShader.addShader("postCanvas_vertex");
        fsShader.addShader("postCanvas_fragment");

        var vertexShader = context3D.creatVertexShader(vsShader.getShaderSource());
        var fragShader = context3D.creatFragmentShader(fsShader.getShaderSource());
        this._usage.program3D = context3D.creatProgram(vertexShader, fragShader);

        //这里需要一个Quad 通用的 indexbuff and vertexbuffer
        this._quadData = new QuadData();
        this._quadData.createBuff(context3D);

        this._usage.attribute_position.uniformIndex = context3D.getShaderAttribLocation(this._usage.program3D, "attribute_position");
        this._usage.attribute_uv0.uniformIndex = context3D.getShaderAttribLocation(this._usage.program3D, "attribute_uv0");
        this._usage.uniform_ProjectionMatrix.uniformIndex = context3D.getUniformLocation(this._usage.program3D, "uniform_ProjectionMatrix");

        var sampler2D;
        for (var index in this._usage.sampler2DList) {
            sampler2D = this._usage.sampler2DList[index];
            sampler2D.uniformIndex = context3D.getUniformLocation(this._usage.program3D, sampler2D.varName);
        }
    }

    public setLightScreenPos(pos: egret3d.Vector3D) {
    }

    public draw(time, delay, view: egret3d.View3D, source: egret3d.FrameBuffer) {
        var context3D: egret3d.Context3D = view.context3D;

        //设置参数
        var fc0Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_uvCenterPos");
        var fc1Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_godray_params");
        var fc2Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_weight_decay_exposure");
        var fc3Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_screenlightPos");
        var tex1Loc = -1;

        //if (null != this._MaskTex) {
        //    context3D.gl.activeTexture(context3D.gl.TEXTURE1);
        //    tex1Loc = context3D.getUniformLocation(this._usage.program3D, "maskTex");
        //}

        context3D.enbable(egret3d.Egret3DDrive.BLEND);
        context3D.setBlendFactors(egret3d.Egret3DDrive.ONE, egret3d.Egret3DDrive.ONE_MINUS_SRC_ALPHA);
        context3D.viewPort(view.viewPort.x, view.viewPort.y, view.viewPort.width, view.viewPort.height);
        context3D.setProgram(this._usage.program3D);
        context3D.bindVertexBuffer(this._quadData.getVertexBuff());

        context3D.vertexAttribPointer(this._usage.program3D, this._usage.attribute_position.uniformIndex, 3, egret3d.Egret3DDrive.FLOAT, false, 20, 0);
        context3D.vertexAttribPointer(this._usage.program3D, this._usage.attribute_uv0.uniformIndex, 2, egret3d.Egret3DDrive.FLOAT, false, 20, 0);
        context3D.uniformMatrix4fv(this._usage.uniform_ProjectionMatrix.uniformIndex, false, view.camera3D.viewProjectionMatrix.rawData);

        context3D.uniform4fv(fc0Loc, this._uvCenterPos);
        context3D.uniform4fv(fc1Loc, this._godRayParam);
        context3D.uniform4fv(fc2Loc, this._godRayParam2);
        context3D.uniform2f(fc3Loc, this._screenLightPos.x, this._screenLightPos.y);

        //if (null != this._MaskTex) {
        //    context3D.setTexture2DAt(context3D.gl.TEXTURE1, tex1Loc, 1, this._MaskTex.texture);
        //}

        var sampler2D = this._usage.sampler2DList[0];
        context3D.setTexture2DAt(sampler2D.activeTextureIndex, sampler2D.uniformIndex, sampler2D.index, source.texture.texture);
        context3D.drawElement(egret3d.DrawMode.TRIANGLES, this._quadData.getIndexBuff(), 0, 6);
    }
}
