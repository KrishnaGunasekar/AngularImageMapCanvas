/**
 * https://medium.com/@tarik.nzl/creating-a-canvas-component-with-free-hand-drawing-with-rxjs-and-angular-61279f577415
 */
import {
  Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit
} from '@angular/core';


import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styles: ['canvas { border: 1px solid #000; }']
})
export class CanvasComponent implements AfterViewInit, OnInit {

  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 1000;
  @Input() public height = 1000;
  previousPosition;
  currentPosition;
  lines = [];

  canvasLines = [];
  cx: CanvasRenderingContext2D;
  adjustY = 0;
  rectangleCoordinates = [];

  pointA = {};
  pointB = {};

  ngOnInit() {

  }
  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
    //this.captureEvents(canvasEl);

  }
  public OnInit() {
    this.uploadFloorMapImage();

  }




  uploadFloorMapImage() {
    //  var myImageUrl = URL.createObjectURL("https://library.truman.edu/about-us/FloorMaps/FirstFloor.jpg");
    var myImage = new Image();
    //  myImage.height=1000;
    //  myImage.width=1000;
    myImage.src = "https://wcs.smartdraw.com/floor-plan/img/template-floor-plan.png?bn=1510011165";
    //  this.width=myImage.width;
    //  alert(myImage.width);
    //  this.height= myImage.height;
    this.cx.drawImage(myImage, 0, 0);


  }


  event: MouseEvent;
  clientX = 0;
  clientY = 0;

  onEvent(event: MouseEvent): void {

    this.event = event;
    this.clientX = event.clientX;
    this.clientY = event.clientY;
    if (event.type.toString() == "click") {

      let cvs = document.getElementById("canvas");
      var rect = cvs.getBoundingClientRect();
      debugger;
      // let x = event.clientX + cvs.offsetLeft;
      // let y = event.clientY + cvs.offsetTop;
      let globalOperation = this.cx.globalCompositeOperation;
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top

      console.log("CANVAS EVENT:: X: " + x + "Y:" + y);
      console.log("CLICK EVENT:: X: " + this.clientX + "Y:" + this.clientY);

      this.clientX = x;
      this.clientY = y;


      if ((this.pointA["X"] == undefined) && (this.pointB["X"] == undefined)) {
        this.pointA = {
          "X": this.clientX,
          "Y": this.clientY
        };
        this.DrawArc(this.clientX, this.clientY);
      } else {
        debugger;
        if (this.pointB["X"] != undefined) {
          let previousArcX = this.pointB["X"];
          let previousArcY = this.pointB["Y"];
          this.pointB = {
            "X": this.clientX,
            "Y": this.clientY
          };
          // this.DrawArc(this.clientX, this.clientY);
          this.ClearArc(previousArcX, previousArcY);

        }

        this.pointB = {
          "X": this.clientX,
          "Y": this.clientY
        };
        this.DrawArc(this.clientX, this.clientY);
        this.DrawRectangle(this.pointA["X"], this.pointA["Y"], this.pointB["X"] - this.pointA["X"], this.pointB["Y"] - this.pointA["Y"]);
      }

    }
  }

  private DrawRectangle(startX, startY, height, width) {
    debugger;
    this.cx.beginPath();
    this.cx.rect(startX, startY, height, width);
    this.cx.stroke();
  }

  private ClearArc(x, y) {
    // this.cx.beginPath();
    this.cx.globalCompositeOperation = 'destination-out';
    this.cx.arc(x, y, 10, 0, Math.PI * 2, true);
    this.cx.fill();
    this.cx.lineWidth = 10;
    this.cx.strokeStyle = '#FFFFF';
    this.cx.stroke();
  }

  private DrawArc(x, y) {
    this.cx.globalCompositeOperation = "source-over";
    this.cx.moveTo(x, y);
    this.cx.beginPath();
    this.cx.arc(x, y, 5, 0, 2 * Math.PI, false);
    this.cx.fillStyle = 'green';
    this.cx.fill();
    this.cx.lineWidth = 5;
    this.cx.strokeStyle = '#003300';
    this.cx.stroke();
  }

  coordinates(event: MouseEvent): void {
    this.clientX = event.clientX;
    this.clientY = event.clientY;

  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              pairwise() /* Return the previous and last values as array */
            )
        })
      ).subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.previousPosition = prevPos;
        this.currentPosition = currentPos;
        // this.canvasLines.push(
        // {

        //   "PrevPosX": prevPos.x,
        //   "PrevPosY": prevPos.y,

        //   "CurrentX": currentPos.x,
        //   "CurrentY": currentPos.y,

        // }
        // );
        this.canvasLines.push({
          "PrevPos": prevPos,
          "CurrentPos": currentPos
        });
        //this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();

    }
    // this.lines.push({
    //     "FromX":prevPos.x,
    //     "FromY":prevPos.y,
    //     "ToX":currentPos.x,
    //     "ToY":currentPos.x,
    //   });
  }
  clearCanvas() {
    this.cx.clearRect(0, 0, this.width, this.height);
    //this.lines=[];
    this.uploadFloorMapImage();
  }


  drawLines() {

    //  this.canvasLines.forEach((element)=>{
    //    this.drawOnCanvas(element.PrevPos,element.CurrentPos);
    //  });
    //  alert("cleared lines");
    // this.lines=[];
    // // this.lines.forEach((element)=>{
    // this.cx.beginPath();
    // this.cx.moveTo(element.X,element.Y);
    // this.cx.lineTo(element.X,element.Y);
    // this.cx.stroke();
    // });



    // if(this.canvasLines.length>0)
    // {
    //   this.lines.push({        
    //     "X":this.canvasLines[0].PrevPosX,
    //     "Y":this.canvasLines[0].PrevPosY        
    //     });

    //     this.lines.push({        
    //     "X":this.canvasLines[0].CurrentX,
    //     "Y":this.canvasLines[0].CurrentY        
    //     });

    // }



    //  this.lines.push({
    //  "X": 202, "Y": 22 
    //     });

    //     this.lines.push({
    //     "X": 459, "Y": 22 
    //     });
    //  this.lines.push({
    //     "X": 454, "Y": 24 
    //     });

    // this.lines.push({
    //     "X": 460, "Y": 242 
    //     });

    for (let i = 0; i < this.lines.length; i++) {
      debugger;
      this.cx.beginPath();
      this.cx.moveTo(this.lines[i].StartX, this.lines[i].StartY);
      this.cx.lineTo(this.lines[i].EndX, this.lines[i].EndY);
      this.cx.stroke();
    }

  }

  arrangeCoordinates() {
    let previousPositionsX = [];
    let previousPositionsY = [];

    this.canvasLines.forEach((element) => {
      previousPositionsX.push(element.PrevPos.x);
      previousPositionsY.push(element.PrevPos.y);
    });

    previousPositionsX = previousPositionsX.sort((n1, n2) => n1 - n2);
    previousPositionsY = previousPositionsY.sort((n1, n2) => n1 - n2);

    debugger;

  }

  createRectangleLine() {
    let previousPositionsX = [];
    let previousPositionsY = [];

    this.canvasLines.forEach((element) => {
      previousPositionsX.push(element.PrevPos.x);
      previousPositionsY.push(element.PrevPos.y);
    });

    previousPositionsX = previousPositionsX.sort((n1, n2) => n1 - n2);
    previousPositionsY = previousPositionsY.sort((n1, n2) => n1 - n2);

    debugger;
    let previousPositionsXLastElementIndex = previousPositionsX.length - 1;
    this.lines.push({
      "StartX": previousPositionsX[0],
      "StartY": previousPositionsY[0],
      "EndX": previousPositionsX[previousPositionsXLastElementIndex],
      "EndY": previousPositionsY[previousPositionsXLastElementIndex]
    });
    this.canvasLines = [];
  }

  GetFinalRectangle() {
    debugger;
    let lines = this.lines;
    let startXElements = [];
    let startYElements = [];
    let endXElements = [];
    let endYElements = [];

    this.lines.forEach((element) => {
      startXElements.push(element.StartX);
      startYElements.push(element.StartY);
      endXElements.push(element.EndX);
      endYElements.push(element.EndY);
    });

    debugger;
    startXElements = startXElements.sort((n1, n2) => n1 - n2);
    startYElements = startYElements.sort((n1, n2) => n1 - n2);
    endXElements = endXElements.sort((n1, n2) => n1 - n2);
    endYElements = endYElements.sort((n1, n2) => n1 - n2);

    let firstCoordinate = startXElements[0];
    let secondCoordinate = startYElements[0];
    let thirdCoordinate = endXElements[endXElements.length - 1];
    let fourthCoordinate = endYElements[endYElements.length - 1];

    console.log("RECT::" + firstCoordinate + "," + secondCoordinate + "," + thirdCoordinate + "," + fourthCoordinate);

    alert("RECT::" + firstCoordinate + "," + secondCoordinate + "," + thirdCoordinate + "," + fourthCoordinate);

  }

}



