class QuadData {


    private _vertexList = [
        //x y z u v
        -0.5, -0.5, 0.0, 0.0, 0.0,
        0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, 0.5, 0.0, 1.0, 1.0,
        -0.5, 0.5, 0.0, 0.0, 1.0
    ];
    private _indexList = [0, 1, 2, 0, 2, 3];
    private _vertexBuffer3D: egret3d.IVertexBuffer3D;
    private _indexBuffer3D: egret3d.IndexBuffer3D;

    public constructor() {
    }

    public getVertexList(): any {
        return this._vertexList;
    }

    public getIndexList(): any {
        return this._indexList;
    }

    public getVertexBuff(): any {
        return this._vertexBuffer3D;
    }

    public getIndexBuff(): any {
        return this._indexBuffer3D;
    }

    public createBuff(context3D: egret3d.Context3D) {
        this._vertexBuffer3D = context3D.creatVertexBuffer(this._vertexList);
        this._indexBuffer3D = context3D.creatIndexBuffer(this._indexList);        
    }

    public dispose() {
        this._vertexBuffer3D = null;
        this._indexBuffer3D = null;
        this._vertexList = null;
        this._indexList = null;
    }
}