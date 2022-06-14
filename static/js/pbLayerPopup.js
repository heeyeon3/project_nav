jQuery(function($){

	var bodyW = $(window).width();
	var bodyH = $(window).height();
	var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;

	// Get max zIndex 
	// popup 1 open --> popup 2 open  --> pupup 1 close  --> popup 3 open 일때 값이 꼬여서 추가
	function getMaxZIndex_layerMasked() {
		var maxIndex = 99200 ;
		
		var $layer = $('._layerMasked');
		
		$layer.each(function() {
			var index_current = parseInt($(this).css('zIndex'), 10);
			if(index_current > maxIndex) {
				maxIndex = index_current;
			}
		});

		return maxIndex;
	}
	
	// Open layer  window
	function layerPopupOpen(targetId){		
		
		//테이블 scroll을 위한 css넣어주기
		if($('#'+targetId+'').find('.tblBody').length){
			var trLength = $('#'+targetId+'').find('.tblBody table tbody tr').length;
			if(trLength > 5){
				$('#'+targetId+'').find('.tblBody').addClass('scrollH');
			}
		}

		//layer Mask
		$('#'+targetId+'').addClass('_layerMasked');
		var maskLength = $('._layerMasked').length;
		var maskzIndex = getMaxZIndex_layerMasked()+1 ;

		var $layerM =$('<div class="layerMask" id="layerMask"/>');
		var $layerSub =$('<div class="layerMask" id="layerMaskSub"/>');

		// layerMask 는 최대 2개만 사용한다.
		if(maskLength == 1){
			$('#'+targetId+'').before($layerM);									// layerMask 추가 
			$layerM.fadeIn(200);
		} else if(maskLength == 2 ){
			$('#'+targetId+'').before($layerSub).css('zIndex',maskzIndex+1); 	// layerMaskSub 추가 
			$('#layerMaskSub').fadeIn(200).css('zIndex',maskzIndex);
		} else if(maskLength > 2 ){
			$('#'+targetId+'').css('zIndex',maskzIndex+1); 
			$('#layerMaskSub').css('zIndex',maskzIndex); 						// layerMaskSub zIndex 만 변경
		}

		$('#'+targetId+'').show();
		//$('body').addClass('scrollN');
		$('html,body').addClass('scrollN');

		//IOS에서 컨텐츠 스크롤 문제 해결
		if (iOS) {
			$('#pbContainer').css({'left':'0','right':'0','position':'fixed','overflow-y':'hidden'});
		}

		var targetW = $('#'+targetId+'').outerWidth();
		var targetH = $('#'+targetId+'').outerHeight();
		var borderW = Number($('#'+targetId+'').css('borderTopWidth').slice(0,-2)); //테두리 보더두께
		var targetHeadH = $('#'+targetId+'').find('div[class^="layerPopHeader"]').outerHeight() + (borderW*2);
		var taegetWValue = Math.round((bodyW-targetW)/2);
		var taegetHValue = Math.round((bodyH-targetH)/2);

		if(targetW >= bodyW){
			$('#'+targetId+'').css({'left':'0','width':bodyW});
		}else if(targetW < bodyW){
			$('#'+targetId+'').css({'left': taegetWValue});
		}
		if(targetH >= bodyH){
			$('#'+targetId+'').css({'top':'0','height':bodyH});
			$('#'+targetId+'').find('.layerPopContent').css({'height':bodyH-targetHeadH});
		}else if(targetH < bodyH){
			$('#'+targetId+'').css({'top': taegetHValue});
		}

		//일반 spinner 레이어 인지 체크하여 콤보값 설정
		if($('#'+targetId+'').find('.spinnerList').length){
			var targetClass = $(event.target).attr('class');
			if(targetClass=='btnCombo')	{
				$(event.target).addClass('targetCombo');
				var evnetText = event.target.text;
				$('#'+targetId+'').find('.spinnerList a').removeClass('on');
				$('#'+targetId+'').find('.spinnerList a').each(function(){
					if($(this).text() == evnetText){
						$(this).addClass('on');
					}
				});
			}
		}
		//기타 사업자 spinner 레이어인지 체크하여 콤보값 설정
		if($('#'+targetId+'').find('.spinnerTabCont').length){
			$(event.target).addClass('targetCombo');
		}

	}

	//일반 spinner
	$(document).on('click', '.spinnerList a', function() {
		var targetId = $(this).parents('section').attr('id');
		var spinnerListText = $(this).text();
		$('.targetCombo').text(spinnerListText);
		$('.targetCombo').trigger('smrt.change');
		$('#'+targetId+'').find('.spinnerList a').removeClass('on');
		//$(this).addClass('on');
		closeLayerPopup(targetId);
	});

	//기타 사업자의 경우
	$(document).on('click', '.spinnerTabCont a', function() {
		var targetId = $(this).parents('section').attr('id');
		var spinnerListText = $(this).text();
		$('.targetCombo').text(spinnerListText);
		$('#'+targetId+'').find('.spinnerTabCont a').removeClass('on');
		$(this).addClass('on');
		closeLayerPopup(targetId);
	});


	//layer mask click
	/*$(document).on('click', '#layerMask', function() {
		var targetId = $(this).next().attr('id');
		var alertCheck = $('#'+targetId+'').attr('class');
		if( alertCheck != 'layerAlertWrap' && alertCheck != 'layerPopWrapPos'){
			//간편로그인 처음 화면 팝업은 배경을 터치해도 팝업이 종료되면 안됨
			//제외 처리
			if('UiLayer_SimpleFirst' != targetId){
				closeLayerPopup(targetId);
			}
		}
	});*/

	//2중 layer mask click
	/*$(document).on('click', '#layerMaskSub', function() {
		var targetId = $(this).next().attr('id');
		closeLayerPopup(targetId);
	});	*/

	// Close button click
	$(document).on('click', 'section[class^="layerPop"] .btnClosePop', function() {
		var targetId = $(this).parent().parent().attr('id');
		closeLayerPopup(targetId);
	});

	// Close layer window
	function closeLayerPopup(targetId){

		$('#'+targetId+'').removeClass('_layerMasked')
		var maskLength = $('._layerMasked').length;
		var maskzIndex = getMaxZIndex_layerMasked()-1 ;

		if(maskLength == 0){
			$('#'+targetId+'').fadeOut(200);
			$('#layerMask').remove();							// layerMask 삭제
		} else if(maskLength == 1){
			$('#'+targetId+'').css('zIndex','').fadeOut(200);
			$('#layerMaskSub').remove();						// layerMaskSub 삭제
		} else if(maskLength > 1){
			$('#'+targetId+'').css('zIndex','').fadeOut(200);
			$('#layerMaskSub').css('zIndex',maskzIndex);		// layerMaskSub zIndex 변경
		}

		$('html,body').removeClass('scrollN');
		//IOS에서 컨텐츠 스크롤 문제 해결
		
		if (iOS) {
			$('#pbContainer').css({'left':'inherit','right':'inherit','position':'inherit','overflow-y':'auto'});
		}
		if($('.btnCombo').length){
			$('.btnCombo').removeClass('targetCombo');
		}
		//검색결과 제어
		if($('#'+targetId+'').find('.touchSliderWrap').length){
			$('#'+targetId+'').find('.searchResultNone').show();
			$('#'+targetId+'').find('.touchSliderWrap').hide();
		}
		return false;
	};

	openPopupFunc = layerPopupOpen;
	closePopupFunc = closeLayerPopup;

});

function openPopup(targetId) {
	openPopupFunc(targetId);
}

function closePopup(targetId) {
	closePopupFunc(targetId);
}
