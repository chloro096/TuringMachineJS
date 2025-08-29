/** CONSTANTS BEGIN */
const COLORS = {
  BASE: "#372400",
  ACCENT: "#EEE0C5",
  I_TXT: "#DDB71E",
  I_BG: "#FFF8D9",
  O_TXT: "#5C66BA",
  O_BG: "#F2F3FF",
  B_TXT: "#C8C8C8",
  B_BG: "#F6F6F6",
  SWITCH_BASE: "#0E1979",
  SWITCH_BG: "#DFE2FC",
  BUTTON_PRESSED: "#7D5D24",
  LEFT: "#0E1979",
  RIGHT: "#790E0E",
  HOVERED: "#F9F4EA",
  WHITE: "#FFF",
  BLACK: "#000",
};

const CELL_SIZE = 40;

const INIT_TAPE_X = 180;
const INIT_TAPE_Y = 340;

const D = {
  L: "L",
  R: "R",
};
const SIGMA = {
  I: "1",
  O: "0",
  B: "B",
};

const ROW_MODE = {
  STATE: 0,
  ADD: 1,
  HALT: 2,
};

const TM_MODE = {
  HALT: "HALT",
  STOP: "STOP",
  EXEC: "EXEC",
  INIT: "INIT",
  READ: "READ",
  WRITE_TAPE: "WRITE_TAPE",
  MOVE_TAPE: "MOVE_TAPE",
  MOVE_SHEET: "MOVE_SHEET",
};
/** CONSTANTS END */

/** CLASSES BEGIN */

class Vec2 {
  constructor(_x, _y) {
    this.x = _x;
    this.y = _y;
  }
}

class Cell {
  constructor(i) {
    this.data = SIGMA.B;
    this.index = i;
    this.isHovered = false;
  }
  read() {
    return this.data;
  }
  write(s) {
    this.data = s;
  }

  draw(tapeX, tapeY) {
    push();
    let bgColor, txtColor;
    switch (this.data) {
      case SIGMA.I:
        bgColor = color(COLORS.I_BG);
        txtColor = color(COLORS.I_TXT);
        break;

      case SIGMA.O:
        bgColor = color(COLORS.O_BG);
        txtColor = color(COLORS.O_TXT);
        break;

      case SIGMA.B:
        bgColor = color(COLORS.B_BG);
        txtColor = color(COLORS.B_TXT);
        break;

      default:
        text(tapeX + this.index * CELL_SIZE);
    }

    fill(bgColor);
    stroke(COLORS.BASE);
    strokeWeight(1);
    square(tapeX + this.index * CELL_SIZE, tapeY, CELL_SIZE);

    this.isHovered = isHovered(
      tapeX + this.index * CELL_SIZE,
      tapeY,
      CELL_SIZE,
      CELL_SIZE
    );
    if (this.isHovered) {
      fill(55, 36, 0, 10);
      square(tapeX + this.index * CELL_SIZE, tapeY, CELL_SIZE);
    }

    fill(txtColor);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(
      this.data,
      tapeX + this.index * CELL_SIZE + CELL_SIZE / 2,
      tapeY + CELL_SIZE / 2
    );
    pop();
  }
}

class Tape {
  constructor() {
    this.position = new Vec2(INIT_TAPE_X, INIT_TAPE_Y);
    this.isMoving = false;
    this.moveDirection = 0;
    this.moveSpeed = 5;
    this.finalPosition = new Vec2(INIT_TAPE_X, INIT_TAPE_Y);

    this.currentCell = 0;
    this.leftCell = -5;
    this.rightCell = 5;
    this.cells = {};
    for (let i = this.leftCell; i <= this.rightCell; i++) {
      this.cells[i] = new Cell(i);
    }
  }

  drawHead() {
    push();
    noFill();
    stroke(COLORS.ACCENT);
    strokeWeight(5);
    square(INIT_TAPE_X, INIT_TAPE_Y, CELL_SIZE);

    fill(COLORS.ACCENT);
    noStroke();
    triangle(
      INIT_TAPE_X + CELL_SIZE / 2 - 10,
      INIT_TAPE_Y - 16,
      INIT_TAPE_X + CELL_SIZE / 2,
      INIT_TAPE_Y - 4,
      INIT_TAPE_X + CELL_SIZE / 2 + 10,
      INIT_TAPE_Y - 16
    );
    pop();
  }

  drawTape() {
    push();
    if (this.isMoving) {
      const moveAmount = this.moveDirection * this.moveSpeed;
      const nextPositionX = this.position.x + moveAmount;

      let isMoveFinished = false;
      if (this.moveDirection > 0 && nextPositionX >= this.finalPosition.x) {
        isMoveFinished = true;
      } else if (
        this.moveDirection < 0 &&
        nextPositionX <= this.finalPosition.x
      ) {
        isMoveFinished = true;
      }

      if (isMoveFinished) {
        this.position.x = this.finalPosition.x;
        this.moveDirection = 0;
        this.isMoving = false;
      } else {
        this.position.x = nextPositionX;
      }
    }
    for (let i = this.leftCell; i <= this.rightCell; i++) {
      this.cells[i].draw(this.position.x, this.position.y);
    }
    this.drawHead();
    pop();
  }

  move(d) {
    if (this.isMoving) {
      return;
    }

    switch (d) {
      case D.L:
        if (this.currentCell <= this.leftCell + 5) {
          this.leftCell -= 1;
          this.cells[this.leftCell] = new Cell(this.leftCell);
        }
        this.moveDirection = 1;
        this.currentCell -= 1;
        break;
      case D.R:
        if (this.currentCell >= this.rightCell - 5) {
          this.rightCell += 1;
          this.cells[this.rightCell] = new Cell(this.rightCell);
        }
        this.moveDirection = -1;
        this.currentCell += 1;
        break;
    }

    this.isMoving = true;

    this.finalPosition.x = this.position.x + this.moveDirection * CELL_SIZE;
  }

  read() {
    if (!this.isMoving) {
      return this.cells[this.currentCell].read();
    }
  }

  write(s) {
    if (this.isMoving) return;
    this.cells[this.currentCell].write(s);
  }

  init(s) {
    if (this.isMoving) {
      return;
    }

    for (let i = this.leftCell; i <= this.rightCell; i++) {
      const cell = this.cells[i];
      if (cell.isHovered) cell.write(s);
    }
  }
}

class SectionQ {
  constructor() {
    this.data = -1;
    this.isHovered = [false, false];
    this.maxIndex = 0;
  }

  read() {
    return this.data;
  }

  write(q) {
    if (q >= -1 && q <= this.maxIndex) {
      this.data = q;
    }
  }

  increment(maxIndex) {
    if (this.data >= maxIndex) {
      this.data = -1;
    } else {
      this.data++;
    }
  }

  decrement(maxIndex) {
    if (this.data === -1) {
      this.data = maxIndex;
    } else {
      this.data--;
    }
  }

  click() {
    if (this.isHovered[0]) {
      this.decrement(this.maxIndex);
    }
    if (this.isHovered[1]) {
      this.increment(this.maxIndex);
    }
  }

  draw(qX, qY, maxIndex) {
    this.maxIndex = maxIndex;
    push();

    let txt;
    if (this.data === -1) {
      txt = "H";
    } else if (this.data < 10) {
      txt = "0" + this.data;
    } else {
      txt = this.data;
    }
    fill(COLORS.BASE);
    noStroke();
    textAlign(CENTER, CENTER);
    textFont(FONTS.REGULAR);
    text(txt, qX + 15, qY + 18);

    if (mouseX > qX && mouseX < qX + 30 && mouseY > qY && mouseY < qY + 36) {
      fill(55, 36, 0, 25);
      rect(qX, qY, 30, 36);
    }
    if (mouseX > qX && mouseX < qX + 30 && mouseY > qY && mouseY < qY + 18) {
      fill(55, 36, 0, 50);
      rect(qX, qY, 30, 18);

      fill(COLORS.WHITE);
      text("-", qX + 15, qY + 7);
      this.isHovered[0] = true;
    } else {
      this.isHovered[0] = false;
    }
    if (
      mouseX > qX &&
      mouseX < qX + 30 &&
      mouseY > qY + 18 &&
      mouseY < qY + 36
    ) {
      fill(55, 36, 0, 50);
      rect(qX, qY + 18, 30, 18);

      fill(COLORS.WHITE);
      text("+", qX + 15, qY + 25);
      this.isHovered[1] = true;
    } else {
      this.isHovered[1] = false;
    }
    pop();
  }
}

class SectionS {
  constructor() {
    this.data = SIGMA.B;
    this.isHovered = false;
  }

  read() {
    return this.data;
  }

  write(s) {
    this.data = s;
  }

  click() {
    if (!this.isHovered) return;

    switch (this.data) {
      case SIGMA.B:
        this.data = SIGMA.O;
        break;

      case SIGMA.O:
        this.data = SIGMA.I;
        break;

      case SIGMA.I:
        this.data = SIGMA.B;
        break;
    }
  }

  draw(sX, sY) {
    push();
    let bgColor, txtColor;
    switch (this.data) {
      case SIGMA.I:
        bgColor = color(COLORS.I_BG);
        txtColor = color(COLORS.I_TXT);
        break;

      case SIGMA.O:
        bgColor = color(COLORS.O_BG);
        txtColor = color(COLORS.O_TXT);
        break;

      case SIGMA.B:
        bgColor = color(COLORS.B_BG);
        txtColor = color(COLORS.B_TXT);
        break;

      default:
        text(sX, sY, 100, 100);
    }
    fill(bgColor);
    noStroke();
    rect(sX, sY, 30, 36);

    fill(txtColor);
    textAlign(CENTER, CENTER);
    textFont(FONTS.REGULAR);
    text(this.data, sX + 15, sY + 18);

    if (isHovered(sX, sY, 30, 36)) {
      fill(55, 36, 0, 25);
      rect(sX, sY, 30, 36);
      this.isHovered = true;
    } else {
      this.isHovered = false;
    }

    pop();
  }
}

class SectionD {
  constructor() {
    this.data = D.L;
    this.isHovered = false;
  }

  read() {
    return this.data;
  }

  write(d) {
    this.data = d;
  }

  click() {
    if (!this.isHovered) return;

    if (this.data === D.L) {
      this.data = D.R;
    } else {
      this.data = D.L;
    }
  }

  draw(dX, dY) {
    push();
    if (this.data === D.L) {
      fill(COLORS.LEFT);
      textAlign(CENTER, CENTER);
      textFont(FONTS.REGULAR);
      text("←", dX + 15, dY + 18);
    }
    if (this.data === D.R) {
      fill(COLORS.RIGHT);
      textAlign(CENTER, CENTER);
      textFont(FONTS.REGULAR);
      text("→", dX + 15, dY + 18);
    }

    if (isHovered(dX, dY, 30, 36)) {
      fill(55, 36, 0, 25);
      noStroke();
      rect(dX, dY, 30, 36);
      this.isHovered = true;
    } else {
      this.isHovered = false;
    }

    pop();
  }
}

class Output {
  constructor() {
    this.isDefined = true;
    this.isHovered = false;
    this.data = {
      Q: new SectionQ(),
      S: new SectionS(),
      D: new SectionD(),
    };
  }

  readQ() {
    return this.data.Q.read();
  }

  readS() {
    return this.data.S.read();
  }

  readD() {
    return this.data.D.read();
  }

  delete() {
    this.data.Q.write(0);
    this.data.S.write(SIGMA.B);
    this.data.D.write(D.L);
    this.isDefined = false;
  }

  define() {
    this.isDefined = true;
  }

  draw(outputX, outputY, maxIndex) {
    if (isHovered(outputX, outputY, 90, 36)) {
      this.isHovered = true;
    } else {
      this.isHovered = false;
    }

    if (this.isDefined) {
      this.data.Q.draw(outputX, outputY, maxIndex);
      this.data.S.draw(outputX + 30, outputY);
      this.data.D.draw(outputX + 60, outputY);
    } else {
      fill(COLORS.ACCENT);
      noStroke();
      rect(outputX, outputY, 90, 36);

      noFill();
      stroke(COLORS.BASE);
      strokeWeight(0.5);
      line(outputX, outputY, outputX + 90, outputY + 36);
    }
  }

  click() {
    if (this.isDefined) {
      this.data.Q.click();
      this.data.S.click();
      this.data.D.click();
    } else {
      if (this.isHovered) {
        this.define();
      }
    }
  }

  keyPressed(key, keyCode) {
    if (keyCode === DELETE && this.isHovered) {
      this.delete();
    }
  }
}

class Row {
  constructor(_stateIndex) {
    this.stateIndex = _stateIndex;
    this.outputI = new Output();
    this.outputO = new Output();
    this.outputB = new Output();
    this.isHovered = false;
  }

  readQ() {
    return {
      I: this.outputI.readQ(),
      O: this.outputO.readQ(),
      B: this.outputB.readQ(),
    };
  }
  readS() {
    return {
      I: this.outputI.readS(),
      O: this.outputO.readS(),
      B: this.outputB.readS(),
    };
  }
  readD() {
    return {
      I: this.outputI.readD(),
      O: this.outputO.readD(),
      B: this.outputB.readD(),
    };
  }

  draw(rowX, rowY, maxIndex) {
    push();
    let txt;
    if (this.stateIndex < 10) {
      txt = "0" + this.stateIndex;
    } else {
      txt = this.stateIndex;
    }
    fill(COLORS.BASE);
    noStroke();
    textAlign(CENTER, CENTER);
    textFont(FONTS.REGULAR);
    text(txt, rowX + 45, rowY + 18);

    this.outputI.draw(rowX + 90, rowY, maxIndex);
    this.outputO.draw(rowX + 180, rowY, maxIndex);
    this.outputB.draw(rowX + 270, rowY, maxIndex);

    if (
      isHovered(rowX, rowY, 90, 36) &&
      this.stateIndex > 0 &&
      this.stateIndex === maxIndex
    ) {
      fill(121, 14, 14, 100);
      rect(rowX, rowY, 90, 36);

      fill(121, 14, 14, 25);
      rect(rowX + 90, rowY, 270, 36);

      fill(COLORS.WHITE);
      noStroke();
      textAlign(CENTER, CENTER);
      textFont(FONTS.BOLD);
      text("DELETE", rowX + 45, rowY + 18);

      this.isHovered = true;
    } else {
      this.isHovered = false;
    }

    pop();
  }

  click() {
    this.outputI.click();
    this.outputO.click();
    this.outputB.click();
  }

  keyPressed(key, keyCode) {
    this.outputI.keyPressed(key, keyCode);
    this.outputO.keyPressed(key, keyCode);
    this.outputB.keyPressed(key, keyCode);
  }
}

class Sheet {
  constructor() {
    this.initState = -1;
    this.maxIndex = 0;

    this.isInputMode = false;
    this.position = new Vec2(20, 72);
    this.length = 0;

    this.isMoving = false;
    this.currentIndex = 1;
    this.moveDirection = 0;
    this.moveSpeed = 4;
    this.finalPosition = new Vec2(20, 72);

    this.rows = [];
    this.rows.push(new Row(0));

    this.addIsHovered = false;
    this.initIsHovered = [false, false];
  }

  setMode(_isInputMode) {
    this.isInputMode = _isInputMode;
    if (_isInputMode) {
      this.position = new Vec2(20, 0);
    } else {
      this.position = new Vec2(20, 72);
    }
  }

  isHovered() {
    let ret = true;

    if (mouseX < 20) ret = false;
    if (mouseX > 380) ret = false;

    if (this.isInputMode) {
      if (mouseY < this.position.y) ret = false;
      if (mouseY > this.position.y + (this.rows.length + 6) * 36 + 16)
        ret = false;
    } else {
      if (mouseY < 72) ret = false;
      if (mouseY > 220) ret = false;
    }

    return ret;
  }

  click() {
    if (!this.isInputMode) return;

    for (let row of this.rows) {
      row.click();
    }

    if (this.addIsHovered) {
      this.maxIndex += 1;
      this.rows.push(new Row(this.maxIndex));
    }

    if (this.initIsHovered[0]) {
      if (this.initState === -1) {
        this.initState = this.maxIndex;
      } else {
        this.initState -= 1;
      }
    }
    if (this.initIsHovered[1]) {
      if (this.initState >= this.maxIndex) {
        this.initState = -1;
      } else {
        this.initState += 1;
      }
    }

    if (this.maxIndex > 0 && this.rows[this.maxIndex].isHovered) {
      this.rows.splice(this.maxIndex);
      this.maxIndex--;
    }
  }

  keyPressed(key, keyCode) {
    for (let row of this.rows) {
      row.keyPressed(key, keyCode);
    }
  }

  moveto(stateIndex) {
    if (this.isInputMode) return;
    if (this.isMoving) return;
    if (this.currentIndex === stateIndex) return;

    if (stateIndex === -1) {
      stateIndex = this.maxIndex + 2;
    }

    if (this.currentIndex > stateIndex) {
      this.moveDirection = 1;
    } else if (this.currentIndex < stateIndex) {
      this.moveDirection = -1;
    }
    this.finalPosition = new Vec2(
      20,
      this.position.y + (this.currentIndex - stateIndex) * 36
    );
    this.currentIndex = stateIndex;
    this.isMoving = true;
  }

  readQ() {
    if (this.isMoving) return;

    return this.rows[this.currentIndex].readQ();
  }

  readS() {
    if (this.isMoving) return;

    return this.rows[this.currentIndex].readS();
  }

  readD() {
    if (this.isMoving) return;

    return this.rows[this.currentIndex].readD();
  }

  readInit() {
    if (!this.isMoving) return this.initState;
  }

  isDefined(s) {
    if (this.currentIndex === 2) return false;

    switch (s) {
      case SIGMA.I:
        return this.rows[this.currentIndex].outputI.isDefined;
      case SIGMA.O:
        return this.rows[this.currentIndex].outputO.isDefined;
      case SIGMA.B:
        return this.rows[this.currentIndex].outputB.isDefined;
      default:
        return false;
    }
  }

  draw() {
    if (this.isMoving) {
      const nextPositionY =
        this.position.y + this.moveDirection * this.moveSpeed;

      let isFinalMove = false;
      if (this.moveDirection > 0 && nextPositionY > this.finalPosition.y) {
        isFinalMove = true;
      }
      if (this.moveDirection < 0 && nextPositionY < this.finalPosition.y) {
        isFinalMove = true;
      }

      if (isFinalMove) {
        this.position.y = this.finalPosition.y;
        this.moveDirection = 0;
        this.isMoving = false;
      } else {
        this.position.y = nextPositionY;
      }
    }

    this.length = (this.rows.length + 6) * 36 + 16;

    push();
    fill(COLORS.WHITE);
    noStroke();
    rect(this.position.x, this.position.y, 360, this.length);

    // texts

    fill(COLORS.BASE);
    textFont(FONTS.REGULAR);
    textSize(12);
    text("DELTA SHEET", this.position.x + 156, this.position.y + 24);
    text("STATE", this.position.x + 30, this.position.y + 138);
    text("S = 1", this.position.x + 122, this.position.y + 138);
    text("S = 0", this.position.x + 214, this.position.y + 138);
    text("S = B", this.position.x + 304, this.position.y + 138);

    textSize(16);
    textFont(FONTS.BOLD);
    text("INIT STATE:", this.position.x + 16, this.position.y + 64);

    text("STATES:", this.position.x + 16, this.position.y + 110);

    // Holt state

    fill(COLORS.BASE);
    noStroke();
    textAlign(CENTER, CENTER);
    textFont(FONTS.REGULAR);
    text(
      "H",
      this.position.x + 45,
      this.position.y + 188 + 36 * this.rows.length + 18
    );

    fill(COLORS.ACCENT);
    noStroke();
    rect(
      this.position.x + 90,
      this.position.y + 188 + 36 * this.rows.length,
      90,
      36
    );
    rect(
      this.position.x + 180,
      this.position.y + 188 + 36 * this.rows.length,
      90,
      36
    );
    rect(
      this.position.x + 270,
      this.position.y + 188 + 36 * this.rows.length,
      90,
      36
    );

    strokeWeight(0.5);
    stroke(COLORS.BASE);
    line(
      this.position.x + 90,
      this.position.y + 188 + 36 * this.rows.length,
      this.position.x + 180,
      this.position.y + 188 + 36 * (this.rows.length + 1)
    );
    line(
      this.position.x + 180,
      this.position.y + 188 + 36 * this.rows.length,
      this.position.x + 270,
      this.position.y + 188 + 36 * (this.rows.length + 1)
    );
    line(
      this.position.x + 270,
      this.position.y + 188 + 36 * this.rows.length,
      this.position.x + 360,
      this.position.y + 188 + 36 * (this.rows.length + 1)
    );

    // init state

    noFill();
    stroke(COLORS.BASE);
    strokeWeight(1);
    rect(this.position.x + 288, this.position.y + 44, 56, 36);

    push();

    let txt;
    if (this.initState === -1) {
      txt = "H";
    } else if (this.initState < 10) {
      txt = "0" + this.initState;
    } else {
      txt = this.initState;
    }
    fill(COLORS.BASE);
    noStroke();
    textAlign(CENTER, CENTER);
    textFont(FONTS.REGULAR);
    text(txt, this.position.x + 288 + 28, this.position.y + 44 + 18);

    if (this.isInputMode) {
      noStroke();

      if (isHovered(this.position.x + 288, this.position.y + 44, 56, 18)) {
        fill(56, 36, 0, 35);
        rect(this.position.x + 288, this.position.y + 44, 56, 18);
        fill(COLORS.WHITE);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("-", this.position.x + 288 + 28, this.position.y + 44 + 9);
        this.initIsHovered[0] = true;
      } else {
        this.initIsHovered[0] = false;
      }

      if (isHovered(this.position.x + 288, this.position.y + 44 + 18, 56, 18)) {
        fill(56, 36, 0, 25);
        rect(this.position.x + 288, this.position.y + 44 + 18, 56, 18);
        fill(COLORS.WHITE);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("+", this.position.x + 288 + 28, this.position.y + 44 + 27);
        this.initIsHovered[1] = true;
      } else {
        this.initIsHovered[1] = false;
      }
    }

    pop();

    // states and outputs

    noFill();
    stroke(COLORS.BASE);
    strokeWeight(1);

    for (let row of this.rows) {
      row.draw(
        this.position.x,
        this.position.y + (4 + row.stateIndex) * 36 + 8,
        this.maxIndex
      );
    }

    // lines

    line(20, this.position.y + 116, 380, this.position.y + 116);
    line(20, this.position.y + 152, 380, this.position.y + 152);
    for (let i = 0; i < this.rows.length + 1; i++) {
      dashedLine(
        20,
        this.position.y + 188 + 36 * i,
        380,
        this.position.y + 188 + 36 * i,
        2
      );
    }
    line(
      20,
      this.position.y + 188 + 36 * (this.rows.length + 1),
      380,
      this.position.y + 188 + 36 * (this.rows.length + 1)
    );

    line(
      this.position.x + 90,
      this.position.y + 116,
      this.position.x + 90,
      this.position.y + 116 + 36 * (this.rows.length + 3)
    );

    dashedLine(
      this.position.x + 180,
      this.position.y + 116,
      this.position.x + 180,
      this.position.y + 116 + 36 * (this.rows.length + 3),
      2
    );

    dashedLine(
      this.position.x + 270,
      this.position.y + 116,
      this.position.x + 270,
      this.position.y + 116 + 36 * (this.rows.length + 3),
      2
    );

    // add state button

    if (
      isHovered(
        this.position.x,
        this.position.y + 188 + 36 * (this.rows.length - 1),
        360,
        36
      )
    ) {
      fill(COLORS.HOVERED);
      noStroke();
      rect(
        this.position.x,
        this.position.y + 188 + 36 * (this.rows.length - 1),
        360,
        36
      );
      this.addIsHovered = true;
    } else {
      fill(COLORS.WHITE);
      noStroke();
      rect(
        this.position.x,
        this.position.y + 188 + 36 * (this.rows.length - 1),
        360,
        36
      );
      this.addIsHovered = false;
    }

    fill(COLORS.BASE);
    textSize(12);
    textFont(FONTS.BOLD);
    textAlign(CENTER, CENTER);
    text(
      "+ ADD STATE",
      200,
      this.position.y + 188 + 36 * (this.rows.length - 1) + 18
    );

    pop();
  }
}

class Rever {
  constructor(_x, _y) {
    const WIDTH = 80;
    const HEIGHT = 24;
    const REVER_WIDTH = 12;
    const REVER_HEIGHT = 24;

    this.offPosition = new Vec2(_x, _y);
    this.onPosition = new Vec2(_x + WIDTH - REVER_WIDTH, _y);
    this.width = WIDTH;
    this.height = HEIGHT;

    this.reverPosition = new Vec2(_x, _y);
    this.reverWidth = REVER_WIDTH;
    this.reverHeight = REVER_HEIGHT;

    this.isON = false;
    this.isMoving = false;
    this.moveDirection = 0;
    this.moveSpeed = 4;
  }

  isHovered() {
    let ret = true;
    if (mouseX < this.offPosition.x) ret = false;
    if (mouseX > this.offPosition.x + this.width) ret = false;
    if (mouseY < this.offPosition.y) ret = false;
    if (mouseY > this.offPosition.y + this.height) ret = false;
    return ret;
  }

  move() {
    if (!this.isON) {
      this.isON = true;
    }
  }

  draw() {
    push();

    if (this.isON) {
      this.reverPosition = this.onPosition;
    } else {
      this.reverPosition = this.offPosition;
    }

    fill(COLORS.WHITE);
    noStroke();
    rect(this.offPosition.x, this.offPosition.y, this.width, this.height);

    fill(COLORS.SWITCH_BASE);
    textSize(12);
    text("EXECUTE", 271, 37);

    fill(COLORS.SWITCH_BASE);
    rect(
      this.reverPosition.x,
      this.reverPosition.y,
      this.reverWidth,
      this.reverHeight
    );

    fill(0, 10);
    rect(this.offPosition.x, this.offPosition.y, this.width, this.height);

    fill(COLORS.SWITCH_BG);
    noStroke();
    rect(250, 20, this.reverPosition.x - 250, 24);

    if (this.isON) {
      fill(COLORS.SWITCH_BASE);
      textSize(10);
      text("EXECUTING...", 256, 36);
    }

    pop();
  }
}

class Button {
  constructor(_x, _y) {
    this.position = new Vec2(_x, _y);
    this.width = 40;
    this.height = 24;
  }

  isHovered() {
    let ret = true;
    if (mouseX < this.position.x) ret = false;
    if (mouseX > this.position.x + this.width) ret = false;
    if (mouseY < this.position.y) ret = false;
    if (mouseY > this.position.y + this.height) ret = false;

    return ret;
  }

  isPressed() {
    if (!this.isHovered()) return false;

    if (mouseIsPressed) {
      return true;
    } else {
      return false;
    }
  }

  draw() {
    push();
    fill(COLORS.BASE);
    noStroke();
    rect(this.position.x, this.position.y, this.width, this.height, 999);

    fill(COLORS.WHITE);
    textSize(12);
    text("STOP", this.position.x + 6, this.position.y + 16);
    if (this.isPressed()) {
      fill(COLORS.BUTTON_PRESSED);
      rect(this.position.x, this.position.y + 1, this.width, this.height, 999);

      fill(COLORS.WHITE);
      textSize(12);
      text("STOP", this.position.x + 6, this.position.y + 17);
    }

    pop();
  }
}

class TM {
  constructor() {
    this.tape = new Tape();
    this.sheet = new Sheet();
    this.rever = new Rever(250, 20);
    this.button = new Button(340, 20);
    this.shutter = [true, true, true, true];

    this.mode = TM_MODE.HALT;
    this.isExecuting = false;
    this.isMoving = false;
  }

  exec() {
    this.mode = TM_MODE.EXEC;
    this.eval();
  }

  stop() {
    this.mode = TM_MODE.STOP;
    this.eval();
  }

  eval() {
    // this(isMoving()) return;

    switch (this.mode) {
      case TM_MODE.EXEC:
        this.isExecuting = true;
        this.shutter = [false, false, false, false];
        this.sheet.moveto(-3);
        this.mode = TM_MODE.INIT;
        break;

      case TM_MODE.INIT: {
        const q = this.sheet.readInit();
        this.sheet.moveto(q);
        this.mode = TM_MODE.READ;
        break;
      }

      case TM_MODE.READ: {
        let s = this.tape.read();
        switch (s) {
          case SIGMA.I:
            this.shutter = [false, false, true, true];
            break;
          case SIGMA.O:
            this.shutter = [false, true, false, true];
            break;
          case SIGMA.B:
            this.shutter = [false, true, true, false];
            break;
          default:
            this.stop();
            break;
        }
        if (this.sheet.isDefined(s)) {
          this.mode = TM_MODE.WRITE_TAPE;
        } else {
          this.mode = TM_MODE.STOP;
        }
        break;
      }

      case TM_MODE.WRITE_TAPE: {
        let s;
        if (!this.shutter[1]) {
          s = this.sheet.readS().I;
        }
        if (!this.shutter[2]) {
          s = this.sheet.readS().O;
        }
        if (!this.shutter[3]) {
          s = this.sheet.readS().B;
        }

        this.tape.write(s);
        this.mode = TM_MODE.MOVE_TAPE;
        break;
      }
      case TM_MODE.MOVE_TAPE: {
        let d;
        if (!this.shutter[1]) {
          d = this.sheet.readD().I;
        }
        if (!this.shutter[2]) {
          d = this.sheet.readD().O;
        }
        if (!this.shutter[3]) {
          d = this.sheet.readD().B;
        }

        this.tape.move(d);
        this.mode = TM_MODE.MOVE_SHEET;
        break;
      }

      case TM_MODE.MOVE_SHEET:
        let q;
        if (!this.shutter[1]) {
          q = this.sheet.readQ().I;
        }
        if (!this.shutter[2]) {
          q = this.sheet.readQ().O;
        }
        if (!this.shutter[3]) {
          q = this.sheet.readQ().B;
        }

        this.shutter = [false, false, false, false];
        this.sheet.moveto(q);
        this.mode = TM_MODE.READ;
        break;

      case TM_MODE.STOP:
        this.isExecuting = false;
        this.shutter = [true, true, true, true];
        this.sheet.moveto(1);
        this.rever.isON = false;
        this.mode = TM_MODE.HALT;
    }
  }

  draw() {
    if (this.sheet.isMoving || this.tape.isMoving) {
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }
    push();

    // background
    background(COLORS.ACCENT);

    // sheet(not inputMode)
    if (!this.sheet.isInputMode) {
      this.sheet.draw();
    }

    // header(title, switch and button)
    fill(COLORS.ACCENT);
    noStroke();
    rect(0, 0, 400, 72);

    stroke(COLORS.BASE);
    strokeWeight(2);
    line(20, 72, 380, 72);

    fill(COLORS.BASE);
    noStroke();
    textFont(FONTS.BOLD);
    textSize(24);
    text("TURING MACHINE", 20, 42);

    this.rever.draw();
    this.button.draw();

    // display
    for (let i = 0; i < 4; i++) {
      if (this.shutter[i] === true) {
        fill(COLORS.BLACK);
        rect(20 + 90 * i, 260, 90, 36);
      }
    }

    this.drawDisplay();
    this.tape.drawTape();

    // sheet(inputMode)
    if (this.sheet.isInputMode) {
      fill(0, 150);
      noStroke();
      rect(0, 0, 400, 400);
      this.sheet.draw();
    }
    pop();
  }

  drawDisplay() {
    push();
    fill(COLORS.BASE);
    noStroke();
    beginShape();
    vertex(0, 220);
    vertex(400, 220);
    vertex(400, 400);
    vertex(0, 400);
    beginContour();
    vertex(20, 260);
    vertex(20, 296);
    vertex(380, 296);
    vertex(380, 260);
    endContour();
    endShape(CLOSE);

    fill(COLORS.WHITE);
    textSize(12);
    text("CURRENT STATE", 12, 248);
    text("TAPE", 12, 328);
    pop();
  }
}

/** CLASSES END */

let machine;
let FONTS = {};

function setup() {
  FONTS = {
    REGULAR: loadFont("assets/InriaSans-Regular.ttf"),
    BOLD: loadFont("assets/InriaSans-Bold.ttf"),
  };
  textFont(FONTS.REGULAR);
  createCanvas(400, 400);
  machine = new TM();
}

function draw() {
  background(255);
  machine.draw();
}

function keyPressed() {
  if (machine.sheet.isInputMode) {
    machine.sheet.keyPressed(key, keyCode);
  } else {
    if (key === "0") {
      machine.tape.init(SIGMA.O);
    }
    if (key === "1") {
      machine.tape.init(SIGMA.I);
    }
    if (key === "B" || key === "b") {
      machine.tape.init(SIGMA.B);
    }

    if (machine.isExecuting) {
      if (keyCode === ENTER) {
        machine.eval();
      }
    } else {
      if (keyCode === RIGHT_ARROW) {
        machine.tape.move(D.R);
      }
      if (keyCode === LEFT_ARROW) {
        machine.tape.move(D.L);
      }
    }
  }
}

function mouseClicked() {
  if (machine.sheet.isInputMode) {
    if (machine.sheet.isHovered()) {
      machine.sheet.click();
    } else {
      machine.sheet.setMode(false);
    }
  } else {
    if (!machine.isExecuting && machine.rever.isHovered()) {
      machine.rever.move();
      machine.exec();
    }
    if (machine.button.isHovered()) {
      machine.rever.isON = false;
      machine.stop();
    }

    if (
      !machine.isExecuting &&
      !machine.isMoving &&
      machine.sheet.isHovered()
    ) {
      machine.sheet.setMode(true);
    }
  }
}

function mouseWheel(event) {
  if (machine.sheet.isInputMode) {
    if (machine.sheet.position.y > 360) {
      machine.sheet.position.y = 360;
    } else if (machine.sheet.position.y < 40 - machine.sheet.length) {
      machine.sheet.position.y = 40 - machine.sheet.length;
    } else {
      machine.sheet.position.y -= event.deltaY * 0.3;
    }
  }
}

/**
 * 破線を描画する関数
 * @param {number} x1 - 始点のx座標
 * @param {number} y1 - 始点のy座標
 * @param {number} x2 - 終点のx座標
 * @param {number} y2 - 終点のy座標
 * @param {number} dashLength - 破線一つあたりの長さ
 */
function dashedLine(x1, y1, x2, y2, dashLength) {
  const d = dist(x1, y1, x2, y2); // 2点間の距離
  const dashCount = floor(d / dashLength); // 描画する破線の数
  const dx = (x2 - x1) / d; // x方向の単位ベクトル
  const dy = (y2 - y1) / d; // y方向の単位ベクトル

  let newX1 = x1;
  let newY1 = y1;

  // 破線を交互に描画
  for (let i = 0; i < dashCount; i++) {
    // iが偶数のときだけ線を描画
    if (i % 2 === 0) {
      let newX2 = newX1 + dx * dashLength;
      let newY2 = newY1 + dy * dashLength;
      line(newX1, newY1, newX2, newY2);
    }
    // 描画開始点を更新
    newX1 += dx * dashLength;
    newY1 += dy * dashLength;
  }
}

function isHovered(_x, _y, _w, _h) {
  if (mouseX > _x && mouseX < _x + _w && mouseY > _y && mouseY < _y + _h) {
    return true;
  }
  return false;
}
