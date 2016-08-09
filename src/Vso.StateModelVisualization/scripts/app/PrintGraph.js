/*---------------------------------------------------------------------
// <copyright file="PrintGraph.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
 // <summary>
 //   Part of the State Model Visualization VSO extension by the
 //     ALM Rangers. The application logic for finding work item by id dialog view.
 //  </summary>
//---------------------------------------------------------------------*/

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(
    ["require", "exports", "VSS/Controls/Dialogs"],
    function (require, exports, Dialogs) {
    var PrintGraph = (function (_super) {
        __extends(PrintGraph, _super);
        function PrintGraph(context) {
            _super.call(this);
            var self = this;
            self.context = context;
        }
        PrintGraph.prototype.start = function (img, witType) {
            var self = this;

            var d = new Date();

            $("#printTitle").text("Visualization of " + witType);
            $("#printDateTime").text("Generated " + d.toLocaleDateString());
            $("#graphImage").attr("src",img);
        };

        return PrintGraph;
    })(Dialogs.ModalDialog);
    exports.PrintGraph = PrintGraph;
});