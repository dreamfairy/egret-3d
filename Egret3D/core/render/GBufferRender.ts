﻿module egret3d {

    class Gbuffer {
        PositionBuffer: FrameBuffer;
        NormalBuffer: FrameBuffer;
        colorBuffer: FrameBuffer;
    }

    export class GBufferRender extends RenderBase {

        private viewPort: Rectangle = new Rectangle(0, 0, 256, 256);
        public gbuffer: Gbuffer = new Gbuffer();
        constructor() {
            super();
            this.gbuffer.PositionBuffer = RttManager.creatFrameBuffer(FrameBufferType.positionFrameBuffer, Egret3DDrive.context3D, 64, 64, FrameBufferFormat.UNSIGNED_BYTE_RGBA );
        }

        /**
        * @language zh_CN
        * 渲染
        * @param time 当前时间
        * @param delay 每帧间隔时间
        * @param context3D 设备上下文
        * @param collect 渲染对象收集器
        * @param camera 渲染时的相机
        */
        public draw(time: number, delay: number, context3D: Context3D, collect: CollectBase, camera: Camera3D, viewPort: Rectangle) {
            this._renderList = collect.renderList;
            this._numEntity = this._renderList.length;

            RttManager.drawToTextureStart(this.gbuffer.PositionBuffer.texture.texture, context3D, this.viewPort);
            for (this._renderIndex = 0; this._renderIndex < this._numEntity; this._renderIndex++) {
                this._renderList[this._renderIndex].update(camera, time, delay);
                if (!this._renderList[this._renderIndex].isVisible) {
                    continue;
                }
                if (this._renderList[this._renderIndex].tag && this._renderList[this._renderIndex].tag.clearDepth && this._renderList[this._renderIndex].tag.cleanState) {
                    this._renderList[this._renderIndex].tag.cleanState = false;
                    context3D.clearDepth(1);
                }
                if (this._renderList[this._renderIndex].material != null) {
                    if (this._renderList[this._renderIndex].material.alpha != 0) {
                       this._renderList[this._renderIndex].material.rendenNormalPass(context3D, camera, this._renderList[this._renderIndex].modelMatrix, this._renderList[this._renderIndex].geometry, this._renderList[this._renderIndex].animation);
                    }
                }
            }

            RttManager.drawToTextureEnd(context3D);

            context3D.viewPort(viewPort.x, viewPort.y, viewPort.width, viewPort.height);
            //--------------back
            for (this._renderIndex = 0; this._renderIndex < this._numEntity; this._renderIndex++) {
                this._renderList[this._renderIndex].update(camera, time, delay);

                if (!this._renderList[this._renderIndex].isVisible) {
                    continue;
                }
                if (this._renderList[this._renderIndex].tag && this._renderList[this._renderIndex].tag.clearDepth && this._renderList[this._renderIndex].tag.cleanState) {
                    this._renderList[this._renderIndex].tag.cleanState = false;
                    context3D.clearDepth(1);
                }

                if (this._renderList[this._renderIndex].material != null) {
                    if (this._renderList[this._renderIndex].material.alpha != 0) {
                        this._renderList[this._renderIndex].material.rendenDiffusePass(context3D, camera, this._renderList[this._renderIndex].modelMatrix, this._renderList[this._renderIndex].geometry, this._renderList[this._renderIndex].animation);
                    }
                }
            }
        }
    }


} 