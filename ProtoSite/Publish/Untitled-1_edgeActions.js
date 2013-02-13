/***********************
* Adobe Edge Animate Composition Actions
*
* Edit this file with caution, being careful to preserve 
* function signatures and comments starting with 'Edge' to maintain the 
* ability to interact with these actions from within Adobe Edge Animate
*
***********************/
(function($, Edge, compId){
var Composition = Edge.Composition, Symbol = Edge.Symbol; // aliases for commonly used Edge classes

   //Edge symbol: 'stage'
   (function(symbolName) {
      
      
      Symbol.bindElementAction(compId, symbolName, "document", "compositionReady", function(sym, e) {
         // insert code to be run when the composition is fully loaded here
         $("#Stage").css("margin","auto");sym.$("b_f").hide();sym.$("b_o1").hide();sym.$("b_l1").hide();sym.$("b_l2").hide();sym.$("b_o2").hide();sym.$("b_w").hide();sym.$("b_m").hide();sym.$("b_e").hide();sym.$("Text").hide();

      });
      //Edge binding end

   })("stage");
   //Edge symbol end:'stage'

})(jQuery, AdobeEdge, "EDGE-329389419");