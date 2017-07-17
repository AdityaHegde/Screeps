let SIN45 = Math.sin(-Math.PI / 4), COS45 = Math.cos(-Math.PI / 4);
let SIN90 = Math.sin(-Math.PI / 2), COS90 = Math.cos(-Math.PI / 2);

module.exports = {
    getDxDy : function(pos0, pos1) {
        let dx, dy;

        if (pos1.dx == pos0.dx && pos1.dy == pos0.dy) {
            return this.getPerpendicularDxDy(pos1.dx, pos1.dy);
        }
        else if ((pos1.dx * pos1.dy == 0 && pos0.dx * pos0.dy == 0) ||
            (pos1.dx * pos1.dy != 0 && pos0.dx * pos0.dy != 0)) {
            dx = Math.ceil(COS45 * pos0.dx - SIN45 * pos0.dy);
            dy = Math.ceil(SIN45 * pos0.dx + COS45 * pos0.dy);
        }
        else if (pos1.dx * pos1.dy == 0) {
            dx = pos1.dy;
            dy = pos1.dx;
        }
        else if (pos0.dx * pos0.dy == 0) {
            dx = pos0.dy;
            dy = pos0.dx;
        }

        return [dx, dy];
    },

    getPerpendicularDxDy : function(dx, dy) {
        return [Math.round(COS90 * dx - SIN90 * dy), Math.round(SIN90 * dx + COS90 * dy)];
    },

    getCentroid : function(points) {
        let x = 0, y = 0;
        points.forEach((point) => {
            x += point.x;
            y += point.y;
        });
        return {
            x : Math.round(x/points.length),
            y : Math.round(y/points.length),
        };
    },
};
