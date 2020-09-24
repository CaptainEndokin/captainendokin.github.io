/// <summary>
    /// Wrapper class for a task with a callback. Can use void callback or an 'object' callback.
    /// </summary>
    export class IDTask
    {
        /// <summary>
        /// Global ID of the task.
        /// </summary>
        private _taskID : number = 0;
        public get TaskID() : number { return this._taskID; }
        private doVoid: boolean = false;
        /// <summary>
        /// Returns true if the task was setup to use a void callback.
        /// </summary>
        public get UseVoidCallback() : boolean { return this.doVoid; }
        private objectCallback:Function; //Callback used for returning objects
        private voidCallback:Function; //Callback used for returning void. Only called if 'doVoid' is true

        /// <summary>
        /// Create an IDTask with a callback returning an 'object'.
        /// </summary>
        public static CreateObj(_objectCallback:Function) : IDTask
        {
            let t = new IDTask();
            //Create own callback as intermediary
            t.objectCallback = _objectCallback;
            if(_objectCallback == null)
            { throw new console.error("IDTask's objectCallback action is null! This should not be possible!"); }
            return t;
        }
        /// <summary>
        /// Create an IDTask with a void callback. Useful if you do not want a returned object.
        public static CreateVoid(_voidCallback:Function) : IDTask
        {
            let t = new IDTask();
            //Create own callback as intermediary
            t.doVoid = true;
            t.voidCallback = _voidCallback;
            return t;
        }
        /// <summary>
        /// Call this when you want to finish the task. Will in turn proceed to fire either the 'object' callback or the void callback.
        /// </summary>
        public GetIntermediaryCallback():Function { return this.OnTaskFinished; }
        /// <summary>
        /// Void callback Action. Only fired if task is already set to use void callback.
        /// </summary>
        /// <returns></returns>
        public GetVoidCallback():Function { return this.voidCallback; }

        private OnTaskFinished = (o, id: number) =>
        {
            console.log(this.voidCallback);
            if (this.doVoid==true) { this.voidCallback(); return; } //Return void, if previously specified
            if(this.objectCallback == null) { throw new console.error("IDTask's objectCallback action is null! This should not be possible!"); }
            this.objectCallback(o); //Return value through callback
        }
    }