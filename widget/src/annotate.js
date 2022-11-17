// annotate.js — Canvas drawing tools for screenshot annotation.
// Tools: draw (freehand), arrow, text, rectangle.
// Uses a transparent <canvas> overlay on top of the screenshot.
//
// React equivalent: react-konva or fabric.js. Both are heavy.
// This is ~100 lines of raw Canvas2D API. No deps, < 3KB.

export function annotationCanvas(screenshotDataUrl) {
    return {
        tool:        'draw',   // 'draw' | 'arrow' | 'text' | 'rect'
        color:       '#ef4444',
        lineWidth:   3,
        isDrawing:   false,
        startX:      0,
        startY:      0,
        history:     [],       // For undo
        canvas:      null,
        ctx:         null,
        snapshot:    null,     // Canvas state before current stroke

        init() {
            this.$nextTick(() => {
                this.canvas = this.$refs.annotationCanvas;
                this.ctx    = this.canvas.getContext('2d');

                // Draw screenshot as base layer
                if (screenshotDataUrl) {
                    const img = new Image();
                    img.onload = () => {
                        this.canvas.width  = img.naturalWidth;
                        this.canvas.height = img.naturalHeight;
                        this.ctx.drawImage(img, 0, 0);
                        this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
                    };
                    img.src = screenshotDataUrl;
                }
            });
        },

        onMouseDown(e) {
            this.isDrawing = true;
            const pos      = this._getPos(e);
            this.startX    = pos.x;
            this.startY    = pos.y;
            this.snapshot  = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

            if (this.tool === 'draw') {
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
            }
        },

        onMouseMove(e) {
            if (!this.isDrawing) return;
            const pos = this._getPos(e);

            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth   = this.lineWidth;
            this.ctx.lineCap     = 'round';
            this.ctx.lineJoin    = 'round';

            if (this.tool === 'draw') {
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
            } else {
                // Restore snapshot so shapes don't stack while dragging
                this.ctx.putImageData(this.snapshot, 0, 0);

                if (this.tool === 'rect') {
                    this.ctx.strokeRect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
                }

                if (this.tool === 'arrow') {
                    this._drawArrow(this.startX, this.startY, pos.x, pos.y);
                }
            }
        },

        onMouseUp() {
            this.isDrawing = false;
            this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        },

        undo() {
            if (this.history.length <= 1) return;
            this.history.pop();
            this.ctx.putImageData(this.history[this.history.length - 1], 0, 0);
        },

        getAnnotatedDataUrl() {
            return this.canvas?.toDataURL('image/png', 0.85) ?? null;
        },

        _getPos(e) {
            const rect  = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width  / rect.width;
            const scaleY = this.canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top)  * scaleY,
            };
        },

        _drawArrow(x1, y1, x2, y2) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const len   = 12;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x2 - len * Math.cos(angle - Math.PI / 6), y2 - len * Math.sin(angle - Math.PI / 6));
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - len * Math.cos(angle + Math.PI / 6), y2 - len * Math.sin(angle + Math.PI / 6));
            this.ctx.stroke();
        },
    };
}
