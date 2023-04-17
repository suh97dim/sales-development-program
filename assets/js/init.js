if (jQuery.fn.dataTable)
	$.extend( true, $.fn.dataTable.defaults, {
		"autoWidth": false,
		"length":false,
		"filter":true,
		"searching": true,
		"bLengthChange" : false,
		"paging": true,
		"pagingType": "simple_numbers",
		"info": false,
		"order": [],
		"bSort": false,
		"columnDefs": [ {
			"targets": 'no-sort',
			"orderable": false,
		} ],
		"width": "auto",
		"language": {
			"processing": "Подождите...",
			"search": "Поиск:",
			"lengthMenu": "Показать _MENU_ записей",
			"info": "Показано _END_ из _TOTAL_ строк",
			"infoEmpty": "Записи с 0 до 0 из 0 записей",
			"infoFiltered": "(отфильтровано из _MAX_ записей)",
			"infoPostFix": "",
			"loadingRecords": "Загрузка записей...",
			"zeroRecords": "Записи отсутствуют.",
			"emptyTable": "нет данных",
			"paginate": {
			  "next": ">",
			  "previous": "<",
			},
			"aria": {
			  "sortAscending": ": активировать для сортировки столбца по возрастанию",
			  "sortDescending": ": активировать для сортировки столбца по убыванию"
			}
		}   
	});

$(function(){

	//фича с несколькими модальными окнами в bootstrap
	$('body').on('hide.bs.modal','.modal', function (e) {
		setTimeout(function() {
			if($('.modal:visible').length>=1)
				$('body').addClass('modal-open');
			}, 800);
	});
	
	$('body').on('change', 'form.validate .validate', function(e) {
		if (e.target.value != e.target.defaultValue)
			checkFormField(e.target);	
	});	
	$('body').on('blur', 'form.validate .validate', function(e) {
		checkFormField(e.target);	
	});	
	
	wstart($('body'));
	
	//обновление капчи в модальном окне (??)
	$('body').on('shown.bs.modal','.modal', function (e) {
		var c = $(e.target).find('img[id^=captcha]');
		if(c.length>0)
		{
			$(c).attr('src','/api/captcha?r='+Math.random());
		}
	});
	
	if (jQuery.fn.mask)
	{
		$('.mask-phone').mask("+7 (999) 999-99-99");
		$('.mask-time').mask("99:99")
		$('.mask-code').mask("9999 9999 9999")
		$('[data-toggle="datepicker"]').mask("99.99.9999");
		$('.mask-pasp-ser').mask("99 99");
		$('.mask-pasp-num').mask("999999");
		$('.mask-voip-code').mask("9999");
	}
		
	if (jQuery.fn.popover)
		$('[data-toggle="popover"]').popover();
		
	if (jQuery.fn.tooltip)
		$('[data-toggle="tooltip"]').tooltip();
	
	if (jQuery.fn.datepicker)
	{		
		$('[data-toggle="datepicker"]').datepicker({
		  autoHide: true,
		  zIndex: 2048,
		  language: 'ru-RU',
		  format: 'dd.mm.yyyy'
		});
	}
	
	if (jQuery.fn.dataTable)
	{
		$('[data-toggle="datatable"]').DataTable({});
	}

	$('.btn-cheque-reg').on('click', function() {
		$(".lk-nav>li>a[href='#tab-1']").tab('show');
	});

	$('.btn-fill-address').on('click', function() {
		$(".lk-nav>li>a[href='#tab-4']").tab('show');
	});
});

function wstart(obj)
{
 	var forms = obj.find('form.ajax');
	if (forms.length > 0)
	{
   	    if(jQuery.fn.ajaxForm)
		{
			forms.ajaxForm({
				beforeSubmit: function(arr, $form, options) {
					
					//нужна проверка
					if ($form.hasClass('validate'))
					{
						//еще не было проверки
						if (!$form.hasClass('validated'))
						{
							$form.addClass('validated');
							
							$form.find('.validate').each(function(i){
								checkFormField($(this));
							});
						}
						
						if ($form.find('.is-invalid').length)
						{
							$form.find('.is-invalid:first').focus();
							return false;
						}							
					}

					//beforeSubmit
					for (var ajf in ajaxForms)
					{
						if ($form.attr('id') == ajaxForms[ajf].id)
						{
							if (typeof ajaxForms[ajf].beforeSubmit == 'function')
								if (ajaxForms[ajf].beforeSubmit(arr, $form, options) === false)
									return false;
						}
					}			
						
					loaderStart();
					return true;
				},
				success: function(responseText, statusText, xhr, $form) {
					loaderStop();
					if (responseText.status < 400)
					{	
						$form.removeClass('validated').resetForm();
						
						for (var ajf in ajaxForms)
						{
							if ($form.attr('id') == ajaxForms[ajf].id)
							{
								if (typeof ajaxForms[ajf].success == 'function')
									ajaxForms[ajf].success(responseText, statusText, xhr, $form);
							}
						}			
					}
					else
					{
						bootbox.alert({message: responseText.message + ' '});
					}
				},
				error: function(responseText, statusText, xhr, $form) {
					loaderStop();
					
					if (typeof responseText.responseJSON != 'undefined')
					{
						callback = null;
						switch (responseText.status)
						{
							case 401:
								if ($form.attr('id').substr(0,8) != 'formAuth')
									callback = function() { document.location.href = "/"; };
								break;
						}
						
						parseFormAnswer($form, responseText.responseJSON.message, callback);
					}
					else
						bootbox.alert("Ошибка запроса!");
				}
			}); 
		}
	
		//init forms
		forms.each(function(i){
			for (var ajf in ajaxForms)
			{
				if ($(this).attr('id') == ajaxForms[ajf].id)
				{
					if (typeof ajaxForms[ajf].init == 'function')
						ajaxForms[ajf].init();					
				}
			}			
		});
	}
		
	return false;
}

function logout()
{
	loaderStart();

	$.ajax({
		url: "api/user/exit",
		method: 'POST',
		success: function(result, textStatus, jqXHR )
		{
			loaderStop();
			document.location.href = "/";
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			loaderStop();
			
			if (typeof jqXHR.responseJSON != 'undefined')
			{
				switch (jqXHR.status)
				{
					case 401:
						callback = function() { document.location.href = "/"; };
						break;
					default: 
						callback = null;
				}
				
				bootbox.alert({
					message: jqXHR.responseJSON.message + ' ',
					callback: callback
				});
			}
			else
				bootbox.alert("Ошибка запроса!");
		}			
	});	
	
	
	return false;
}

function checkFormField(field)
{
	var parent = $(field).parent(),
		form = $(field).closest('form');

	switch ($(field)[0].tagName)
	{
		case 'INPUT':
			switch ($(field).attr('type'))
			{
				case 'radio':
				case 'checkbox':
					value = $(field).is(':checked');
					break;
				default:
					value = $(field).val();
			}
			break;
		
		case 'SELECT':
			value = $(field).find('option:selected').val();		
			break;
		case 'TEXTAREA':
		default: 
			value = $(field).val();		
	}

	if (!value)
		$(field).addClass('is-invalid');				
	else
		$(field).removeClass('is-invalid');
	
	return false;
}

function parseFormAnswer(form, message, callback)
{
	callback = callback || null;
	
	if (typeof message == 'object')
	{
		var msg = '';
		for (key in message)
		{
			field = $(form).find('[name=' + key + ']');			
			parent = $(field).parent();
			
			$(field).addClass('is-invalid');		
			parent.find('small.help-block').html(message[key]);
			
			if (showMessageModal)
			{
				msg += message[key] + "</br>";
			}
		}
		
		if (showMessageModal)
			bootbox.alert(msg, callback);		
	}
	else
	{
		bootbox.alert(message, callback);		
	}
	
	return false;
}

function innCheck(inn) 
{
	var answer = false;
	var multiply = 0;
	var multiply2 = 0;
	var str = String(inn);
	var specialMultiplyArr = {
		ten: [2, 4, 10, 3, 5, 9, 4, 6, 8],
		eleven: [[7, 2, 4, 10, 3, 5, 9, 4, 6, 8], [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]]
	}

	if(str.length == 10) 
	{
		for(i=0; i<9; i++) 
		{
			multiply += str[i] * specialMultiplyArr.ten[i];
		}

		multiply2 = (multiply % 11) % 10;

		if(multiply2 == str[9] || (multiply2 == 10 && str[9] == 0)) 
		{
			answer = true;
		}
	} 
	else 
		if(str.length == 12) 
		{
			for(i=0; i<10; i++) 
			{
				multiply += str[i] * specialMultiplyArr.eleven[0][i];
			}
			multiply2 = (multiply % 11) % 10;
			if(multiply2 == str[10]) 
			{
				multiply = 0;
				multiply2 = 0;
				for(i=0; i<11; i++) 
				{
					multiply += str[i] * specialMultiplyArr.eleven[1][i];
				}
				multiply2 = (multiply % 11) % 10;

				if(multiply2 == str[11]) 
				{
					answer = true;
				}
			}
		} 
		else 
		{
			answer = false;
		}

	return answer;
}

function copyToClipboard(element) 
{
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val($(element).text()).select();
	document.execCommand("copy");
	$temp.remove();

	return false;
}
