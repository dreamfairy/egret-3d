
class ColorMaterial extends egret3d.MaterialBase {
    public constructor(texture: egret3d.TextureBase, color: egret3d.Color = null) {
        super();

        this.materialData.matType = egret3d.MaterialType.DIFFUSE;
        this.materialData.diffuseTex = texture;

        //this.initMatPass();
        this.diffusePass = this.createDiffusePass(color ? color : new egret3d.Color(255,0,0,255));
    }

    public createDiffusePass(color: egret3d.Color): any {
        return new ColorDiffusePass(this.materialData, color);
    }
}

class ColorDiffusePass extends egret3d.MaterialPassBase {
    private _color: egret3d.Color;
    private _colorLoc;
    public constructor(data: egret3d.MaterialData, color: egret3d.Color) {
        super(data);
        this._color = color;
    }

    public initShader(context3D: egret3d.Context3D, geomerty: egret3d.GeometryBase, animation: egret3d.IAnimation) {
        super.initShader(context3D, geomerty, animation);
        var vsShader = new egret3d.GLSL.ShaderBase(this.materialData, this.materialData.diffusePassUsageData);
        var psShader = new egret3d.GLSL.ShaderBase(this.materialData, this.materialData.diffusePassUsageData);
        this.materialData.context3D = context3D;
        vsShader.addShader("RTT_ChangeColor_vertex");
        psShader.addShader("RTT_ChangeColor_fragment");

        var vs: string = vsShader.getShaderSource();
        var fs: string = psShader.getShaderSource();

        var vs_shader: egret3d.IShader = context3D.creatVertexShader(vs);
        var fs_shader: egret3d.IShader = context3D.creatFragmentShader(fs);

        this.materialData.diffusePassUsageData.program3D = context3D.creatProgram(vs_shader, fs_shader);

        this.context3DChange = true;
    }

    private updateVertexShader(context3D: egret3d.Context3D, modeltransform: egret3d.Matrix4_4, camera3D: egret3d.Camera3D, geometry: egret3d.GeometryBase, animation: egret3d.IAnimation) {
        var usage = this.materialData.diffusePassUsageData;
        context3D.vertexAttribPointer(usage.program3D, usage.attribute_position.uniformIndex, 3, egret3d.Egret3DDrive.FLOAT, false, geometry.vertexSizeInBytes, 0);
        //context3D.vertexAttribPointer(usage.program3D, usage.attribute_normal.uniformIndex, 3, egret3d.Egret3DDrive.FLOAT, false, geometry.vertexSizeInBytes, 12);
        //context3D.vertexAttribPointer(usage.program3D, usage.attribute_tangent.uniformIndex, 3, egret3d.Egret3DDrive.FLOAT, false, geometry.vertexSizeInBytes, 24);
        //context3D.vertexAttribPointer(usage.program3D, usage.attribute_color.uniformIndex, 4, egret3d.Egret3DDrive.FLOAT, false, geometry.vertexSizeInBytes, 36);
        context3D.vertexAttribPointer(usage.program3D, usage.attribute_uv0.uniformIndex, 2, egret3d.Egret3DDrive.FLOAT, false, geometry.vertexSizeInBytes, 52);
        //context3D.vertexAttribPointer(usage.program3D, usage.attribute_uv1.uniformIndex, 2, egret3d.Egret3DDrive.FLOAT, false, geometry.vertexSizeInBytes, 60);
        context3D.uniformMatrix4fv(usage.uniform_ModelMatrix.uniformIndex, false, modeltransform.rawData);
        context3D.uniformMatrix4fv(usage.uniform_ProjectionMatrix.uniformIndex, false, camera3D.viewProjectionMatrix.rawData);
    }

    public activate(context3D: egret3d.Context3D, modeltransform: egret3d.Matrix4_4, camera3D: egret3d.Camera3D, geometry: egret3d.GeometryBase, animation: egret3d.IAnimation) {

        geometry.sharedVertexBuffer = context3D.creatVertexBuffer(geometry.verticesData);
        geometry.numberOfVertices = geometry.verticesData.length / geometry.vertexAttLength;
        geometry.vertexSizeInBytes = geometry.positionSize * Float32Array.BYTES_PER_ELEMENT +
            3 * Float32Array.BYTES_PER_ELEMENT +
            3 * Float32Array.BYTES_PER_ELEMENT +
            4 * Float32Array.BYTES_PER_ELEMENT +
            2 * Float32Array.BYTES_PER_ELEMENT +
            2 * Float32Array.BYTES_PER_ELEMENT; //uv2 60

        geometry.sharedIndexBuffer = context3D.creatIndexBuffer(geometry.indexData);
        context3D.bindVertexBuffer(geometry.sharedVertexBuffer);

        var usage = this.materialData.diffusePassUsageData;
        var program3D = this.materialData.diffusePassUsageData.program3D;
        usage.attribute_position.uniformIndex = context3D.getShaderAttribLocation(program3D, usage.attribute_position.name);
        //usage.attribute_normal.uniformIndex = context3D.getShaderAttribLocation(program3D, usage.attribute_normal.name);
        //usage.attribute_tangent.uniformIndex = context3D.getShaderAttribLocation(program3D, usage.attribute_tangent.name);
        //usage.attribute_color.uniformIndex = context3D.getShaderAttribLocation(program3D, usage.attribute_color.name);
        usage.attribute_uv0.uniformIndex = context3D.getShaderAttribLocation(program3D, usage.attribute_uv0.name);
        //usage.attribute_uv1.uniformIndex = context3D.getShaderAttribLocation(program3D, usage.attribute_uv1.name);

        usage.uniform_ModelMatrix.uniformIndex = context3D.getUniformLocation(program3D, usage.uniform_ModelMatrix.name);
        usage.uniform_ProjectionMatrix.uniformIndex = context3D.getUniformLocation(program3D, usage.uniform_ProjectionMatrix.name);

        this._colorLoc = context3D.getUniformLocation(program3D, "uniform_changeColor");
        
        this.resetTexture();

        var sampler2D;
        for (var index in this.materialData.diffusePassUsageData.sampler2DList) {
            sampler2D = this.materialData.diffusePassUsageData.sampler2DList[index];
            sampler2D.uniformIndex = context3D.getUniformLocation(this.materialData.diffusePassUsageData.program3D, sampler2D.varName);
        }
    }

    public resetTexture() {
        var sampler2D;
        for (var index in this.materialData.diffusePassUsageData.sampler2DList) {
            sampler2D = this.materialData.diffusePassUsageData.sampler2DList[index];
            if (this.materialData[sampler2D.varName]) {
                sampler2D.texture = this.materialData[sampler2D.varName];
            }
        }
        this.materialData.textureChange = false;
    }

    public draw(context3D: egret3d.Context3D, modeltransform: egret3d.Matrix4_4, camera3D: egret3d.Camera3D, geometry: egret3d.GeometryBase, animation: egret3d.IAnimation) {
        super.draw(context3D, modeltransform, camera3D, geometry, animation);

        var usage = this.materialData.diffusePassUsageData;
        context3D.setProgram(usage.program3D);

        //texture 2D
        var sampler2D;
        for (var index in this.materialData.diffusePassUsageData.sampler2DList) {
            sampler2D = this.materialData.diffusePassUsageData.sampler2DList[index];
            sampler2D.texture.upload(context3D);
            context3D.setTexture2DAt(sampler2D.activeTextureIndex, sampler2D.uniformIndex, sampler2D.index, sampler2D.texture.texture);
            if (this.materialData.materialDataNeedChange) {
                var min_filter = this.materialData.smooth ? context3D.gl.LINEAR_MIPMAP_LINEAR : context3D.gl.LINEAR;
                var mag_filter = this.materialData.smooth ? context3D.gl.LINEAR : context3D.gl.LINEAR;
                var wrap_u_filter = this.materialData.repeat ? context3D.gl.REPEAT : context3D.gl.CLAMP_TO_EDGE;
                var wrap_v_filter = this.materialData.repeat ? context3D.gl.REPEAT : context3D.gl.CLAMP_TO_EDGE;
                context3D.setTexture2DSamplerState(min_filter, mag_filter, wrap_u_filter, wrap_v_filter);
                this.materialData.materialDataNeedChange = false;
            }
        }

        this.updateVertexShader(context3D, modeltransform, camera3D, geometry, animation);

        context3D.uniform4fv(this._colorLoc, [this._color.r, this._color.g, this._color.b, this._color.a]);

        context3D.gl.enable(egret3d.Egret3DDrive.BLEND);
        context3D.gl.blendFunc(egret3d.Egret3DDrive.ONE, egret3d.Egret3DDrive.ONE_MINUS_SRC_ALPHA);
        context3D.gl.bindBuffer(egret3d.Egret3DDrive.ELEMENT_ARRAY_BUFFER, geometry.sharedIndexBuffer.buffer);
        context3D.gl.drawElements(this.materialData.drawMode, geometry.numItems, egret3d.Egret3DDrive.UNSIGNED_SHORT, 0);

        if (this.materialData.alphaBlending)
            context3D.gl.depthMask(true);
        for (var index in this.materialData.diffusePassUsageData.sampler2DList) {
            //sampler2D = this.materialData.defaultPassUsageData.sampler2DList[index];
            //sampler2D.texture = this.materialData[sampler2D.varName]
            //sampler2D.texture.upload(context3D);
            //context3D.setTexture2DAt(sampler2D.activeTextureIndex, sampler2D.uniformIndex, sampler2D.index, sampler2D.texture.texture);
            //context3D.gl.bindTexture();
            context3D.gl.bindTexture(context3D.gl.TEXTURE_2D, null);
        }
    }
}

