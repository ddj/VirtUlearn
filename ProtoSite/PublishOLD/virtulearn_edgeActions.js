
(function($,Edge,compId){var Composition=Edge.Composition,Symbol=Edge.Symbol;
//Edge symbol: 'stage'
(function(symbolName){Symbol.bindElementAction(compId, symbolName, "document", "compositionReady", function(sym,e){$("#Stage").css("margin","auto");sym.$("b_f").hide();sym.$("b_o1").hide();sym.$("b_l1").hide();sym.$("b_l2").hide();sym.$("b_o2").hide();sym.$("b_w").hide();sym.$("b_m").hide();sym.$("b_e").hide();sym.$("Text").hide();});
//Edge binding end
Symbol.bindElementAction(compId, symbolName, "${_stage_bg}", "click", function(sym,e){sym.stop();$("<input type='text' name='Username' id='userText' size='15'>").appendTo("#Stage");sym.$("#userText").css({"position":"fixed","top":"42%","left":"47%"});$("<input type='password' name='Password' id='passText' size='15'>").appendTo("#Stage");sym.$("#passText").css({"position":"fixed","top":"48%","left":"47%"});sym.$("Text").show();});
//Edge binding end
Symbol.bindElementAction(compId, symbolName, "${_r01la}", "click", function(sym,e){sym.play(9141);sym.$("Text").hide();sym.$("#userText").hide();sym.$("#passText").hide();});
//Edge binding end
})("stage");
   //Edge symbol end:'stage'

})(jQuery, AdobeEdge, "EDGE-1109673");