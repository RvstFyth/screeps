RoomObject.prototype.say = function(what: string) {
    if(this.room) {
        this.room.visual.line(this.pos.x, this.pos.y, this.pos.x + 1 - 0.2, this.pos.y - 1, {
            color: "#eeeeee",
            opacity: 0.9,
            width: 0.1
        }).circle(this.pos, {
            fill: "#aaffaa",
            opacity: 0.9
        }).text(what, this.pos.x + 1, this.pos.y - 1, {
            color: "black",
            opacity: 0.9,
            align: "left",
            font: "bold 0.6 Arial",
            backgroundColor: "black",
            backgroundPadding: 0.3
        }).text(what, this.pos.x + 1, this.pos.y - 1, {
            color: "black",
            opacity: 0.9,
            align: "left",
            font: "bold 0.6 Arial",
            backgroundColor: "#eeeeee",
            backgroundPadding: 0.2
        });
    }
}
