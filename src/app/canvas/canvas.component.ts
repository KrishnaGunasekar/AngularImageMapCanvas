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
  lines = [];

  canvasLines = [];
  cx: CanvasRenderingContext2D;
  adjustY = 0;
  rectangleCoordinates = [];

  pointA = {};
  pointB = {};

  ImageShapes = [];

  RectangeCoords = {};

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
    this.cx.beginPath();
    this.cx.rect(startX, startY, height, width);
    this.cx.stroke();
    this.RectangeCoords = {
      x: startX,
      y: startY,
      height: height,
      width: width
    };
  }

  private ClearArc(x, y) {
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

  AddShape() {
    this.ImageShapes.push(this.RectangeCoords);
    this.pointA = {};
    this.pointB = {};
  }

  clearCanvas() {
    this.cx.clearRect(0, 0, this.width, this.height);
    this.uploadFloorMapImage();
  }




}



