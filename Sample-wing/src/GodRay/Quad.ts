enum eRenderStep {
    Sun,
    SunMask,
    SunCover
};

class Quad {
    private _vertexList = [
    //x y z u v
        -0.5, -0.5, 0.0, 0.0, 0.0,
        0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, 0.5, 0.0, 1.0, 1.0,
        -0.5, 0.5, 0.0, 0.0, 1.0
    ];
    private _indexList = [0, 1, 2, 0, 2, 3];
    private _vertexBuffer3D;
    private _indexBuffer3D;

    private _view: egret3d.View3D;
    private _modelMat: egret3d.Matrix4_4 = new egret3d.Matrix4_4();
    private _defaultUsage: egret3d.MethodUsageData;
    private _GodRayUsage: egret3d.MethodUsageData;
    private _vsShader: egret3d.GLSL.ShaderBase;
    private _fsShader: egret3d.GLSL.ShaderBase;

    private _position: egret3d.Vector3D = new egret3d.Vector3D();
    private _scale: egret3d.Vector3D = new egret3d.Vector3D(1,1,1);
    private _rotation: egret3d.Vector3D = new egret3d.Vector3D();
    private _dataDirty: boolean = true;

    //god ray 参数
    //private var m_num_samples : uint = 30;  //循环次数
    //private var m_density : Number = 0.8 //强度，强度越大，光的长度越短
    //private var m_exposure : Number = 0.55;   //总体强度
    //private var m_weight : Number = 3.50; //每次采样的强度
    //private var m_decay : Number = 0.8; //远离光源的衰减因子

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

    private _fbo: egret3d.FrameBuffer;
    private _rttSun: RTTSun;
    private _rttCover: RTTSunAndMaskCover;
    private _time: number;
    private _delay: number;

    public constructor(view: egret3d.View3D) {
        this._vertexBuffer3D = view.context3D.creatVertexBuffer(this._vertexList);
        this._indexBuffer3D = view.context3D.creatIndexBuffer(this._indexList);
        this._view = view;
        this._defaultUsage = new egret3d.MethodUsageData();
        this._GodRayUsage = new egret3d.MethodUsageData();

        this._rttSun = new RTTSun();
        this._rttCover = new RTTSunAndMaskCover();
    }

    public setLightPos(pos: egret3d.Vector3D) {
        if (this._dataDirty) {
            this.updateMat();
        }

        var mvpMat: egret3d.Matrix4_4 = this._modelMat.clone();
        mvpMat.append(this._view.camera3D.viewProjectionMatrix);

        this._screenLightPos = mvpMat.transformVector(pos);
        var tempX = (this._screenLightPos.x / this._screenLightPos.w * 0.5 + 0.5);
        this._screenLightPos.x = tempX;
        var tempY = (this._screenLightPos.y / this._screenLightPos.w * 0.5 + 0.5)
        this._screenLightPos.y = tempY;
    }

    private handleBeforeDraw() {

        this._fbo = this._fbo || egret3d.RttManager.creatFrameBuffer(
            egret3d.FrameBufferType.defaultFrameBuffer,
            this._view.context3D,
            this._view.viewPort.width, this._view.viewPort.height,
            egret3d.FrameBufferFormat.UNSIGNED_BYTE_RGB
        );

        var context3D: egret3d.Context3D = this._view.context3D;
        var rec: egret3d.Rectangle = this._view.viewPort;
        context3D.viewPort(rec.x, rec.y, rec.width, rec.height);
        context3D.setRenderToTexture(this._fbo.texture.texture, true, 0);
    }

    private handleAfterDraw() {
        this._view.context3D.setRenderToBackBuffer();
    }

    private renderTarget(currentRTT: RTTBase) {
        if (null == currentRTT) return;

        currentRTT.draw(this._time, this._delay, this._view, this._fbo);
        var context3D: egret3d.Context3D = this._view.context3D;
        var rec: egret3d.Rectangle = this._view.viewPort;
        var render: egret3d.RenderBase = egret3d.RenderManager.getRender(egret3d.RenderType.defaultRender);
        
        render.draw(this._time, this._delay, context3D, currentRTT.getCollect(), this._view.camera3D, rec);
       
        this._view.context3D.clearDepth(1);

        currentRTT.draw(this._time, this._delay, this._view, this._fbo);
    }

    private handleRTT(eState: eRenderStep) {
        switch (eState) {
            case eRenderStep.Sun:
                this.renderTarget(this._rttSun);
                break;
            case eRenderStep.SunMask:
                
                break;
            case eRenderStep.SunCover:
                this.renderTarget(this._rttCover);
                break;
        }
    }

    public draw(time, delay) {
        var context3D: egret3d.Context3D = this._view.context3D;
        this._time = time;
        this._delay = delay;
        this.handleBeforeDraw();

        this.handleRTT(eRenderStep.Sun);
        //debug instert once
        //this.createProgram(eRenderStep.Sun);
        //this.parpareDraw(eRenderStep.Sun);
        //debug end
        this.handleRTT(eRenderStep.SunCover);

        
        this.handleAfterDraw();

        //quad draw

        if (this._dataDirty) {
            this.updateMat();
        }

        this.createProgram(eRenderStep.Sun);
        this.parpareDraw(eRenderStep.Sun);
    }

    public set position(pos: egret3d.Vector3D) {
        this._position.copyFrom(pos);
        this._dataDirty = true;
    }

    public get position(): egret3d.Vector3D {
        return this._position;
    }

    public set rotation(rot: egret3d.Vector3D) {
        this._rotation.copyFrom(rot);
        this._dataDirty = true;
    }

    public get rotation(): egret3d.Vector3D {
        return this._rotation;
    }

    public set scale(s: egret3d.Vector3D) {
        this._scale.copyFrom(s);
        this._dataDirty = true;
    }

    public get scale(): egret3d.Vector3D {
        return this._rotation;
    }

    private createProgram(eState: eRenderStep) {
        switch (eState) {
            case eRenderStep.Sun:
                this.createDefaultShader();
                break;
            case eRenderStep.SunMask:
                this.createGodRayShader();
                break;
            case eRenderStep.SunCover:
                this.createDefaultShader();
                break;
        }
    }

    private parpareDraw(eState: eRenderStep) {
        switch (eState) {
            case eRenderStep.Sun:
                this.drawDefault();
                break;
            case eRenderStep.SunMask:
                this.drawGodRay();
                break;
            case eRenderStep.SunCover:
                this.drawDefault();
                break;
        }
    }

    private drawDefault() {
        var context3D = this._view.context3D;

        context3D.enbable(egret3d.Egret3DDrive.BLEND);
        context3D.setBlendFactors(egret3d.Egret3DDrive.ONE, egret3d.Egret3DDrive.ONE_MINUS_SRC_ALPHA);
        context3D.viewPort(this._view.viewPort.x, this._view.viewPort.y, this._view.viewPort.width, this._view.viewPort.height);
        context3D.setProgram(this._defaultUsage.program3D);
        context3D.bindVertexBuffer(this._vertexBuffer3D);

        context3D.vertexAttribPointer(this._defaultUsage.program3D, this._defaultUsage.attribute_position.uniformIndex, 3, egret3d.Egret3DDrive.FLOAT, false, 20, 0);
        context3D.vertexAttribPointer(this._defaultUsage.program3D, this._defaultUsage.attribute_uv0.uniformIndex, 2, egret3d.Egret3DDrive.FLOAT, false, 20, 0);
        context3D.uniformMatrix4fv(this._defaultUsage.uniform_ProjectionMatrix.uniformIndex, false, this._view.camera3D.viewProjectionMatrix.rawData);
        context3D.uniformMatrix4fv(this._defaultUsage.uniform_ModelMatrix.uniformIndex, false, this._modelMat.rawData);

        var sampler2D = this._defaultUsage.sampler2DList[0];
        context3D.setTexture2DAt(sampler2D.activeTextureIndex, sampler2D.uniformIndex, sampler2D.index, this._fbo.texture.texture);
        context3D.drawElement(egret3d.DrawMode.TRIANGLES, this._indexBuffer3D, 0, 6);
    }

    private drawGodRay() {
        ////设置参数
        //var fc0Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_uvCenterPos");
        //var fc1Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_godray_params");
        //var fc2Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_weight_decay_exposure");
        //var fc3Loc = context3D.getUniformLocation(this._usage.program3D, "uniform_screenlightPos");
        //var tex1Loc = -1;
        //if (null != this._MaskTex) {
        //    context3D.gl.activeTexture(context3D.gl.TEXTURE1);
        //    tex1Loc = context3D.getUniformLocation(this._usage.program3D, "maskTex");
        //}

        //context3D.enbable(egret3d.Egret3DDrive.BLEND);
        //context3D.setBlendFactors(egret3d.Egret3DDrive.ONE, egret3d.Egret3DDrive.ONE_MINUS_SRC_ALPHA);
        //context3D.viewPort(this._view.viewPort.x, this._view.viewPort.y, this._view.viewPort.width, this._view.viewPort.height);
        //context3D.setProgram(this._usage.program3D);
        //context3D.bindVertexBuffer(this._vertexBuffer3D);
        //context3D.vertexAttribPointer(this._usage.program3D, this._usage.attribute_position.uniformIndex, 3, egret3d.Egret3DDrive.FLOAT, false, 20, 0);
        //context3D.vertexAttribPointer(this._usage.program3D, this._usage.attribute_uv0.uniformIndex, 2, egret3d.Egret3DDrive.FLOAT, false, 20, 0);
        //context3D.uniformMatrix4fv(this._usage.uniform_ProjectionMatrix.uniformIndex, false, this._mvpMat.rawData);

        //context3D.uniform4fv(fc0Loc, this._uvCenterPos);
        //context3D.uniform4fv(fc1Loc, this._godRayParam);
        //context3D.uniform4fv(fc2Loc, this._godRayParam2);
        //context3D.uniform2f(fc3Loc, this._screenLightPos.x, this._screenLightPos.y);

        //if (null != this._MaskTex) {
        //    context3D.setTexture2DAt(context3D.gl.TEXTURE1, tex1Loc, 1, this._MaskTex.texture);
        //}
    }

    private createGodRayShader() {

    }

    private createDefaultShader() {

        if (null != this._defaultUsage.program3D) return;

        this._vsShader = new egret3d.GLSL.ShaderBase(null, this._defaultUsage);
        this._fsShader = new egret3d.GLSL.ShaderBase(null, this._defaultUsage);
        this._vsShader.addShader("general_vertex");
        this._fsShader.addShader("general_fragment");
        var vertexShader = this._view.context3D.creatVertexShader(this._vsShader.getShaderSource());
        var fragShader = this._view.context3D.creatFragmentShader(this._fsShader.getShaderSource());
        this._defaultUsage.program3D = this._view.context3D.creatProgram(vertexShader, fragShader);

        var context3D: egret3d.Context3D = this._view.context3D;
        this._defaultUsage.attribute_position.uniformIndex = context3D.getShaderAttribLocation(this._defaultUsage.program3D, "attribute_position");
        this._defaultUsage.attribute_uv0.uniformIndex = context3D.getShaderAttribLocation(this._defaultUsage.program3D, "attribute_uv0");
        this._defaultUsage.uniform_ProjectionMatrix.uniformIndex = context3D.getUniformLocation(this._defaultUsage.program3D, "uniform_ProjectionMatrix");
        this._defaultUsage.uniform_ModelMatrix.uniformIndex = context3D.getUniformLocation(this._defaultUsage.program3D, "uniform_ModelMatrix");

        var sampler2D;
        for (var index in this._defaultUsage.sampler2DList) {
            sampler2D = this._defaultUsage.sampler2DList[index];
            sampler2D.uniformIndex = context3D.getUniformLocation(this._defaultUsage.program3D, sampler2D.varName);
        }
    }

    private updateMat() {
        this._dataDirty = false;

        this._modelMat.identity();
        this._modelMat.recompose([this._position, this._rotation, this._scale]);
    }
}