
$(function () {

    // setTimeout(function () { $('#modal-reg').modal('show') }, 1000)

    // bootstrap-fileinput
    $(".bootstrap-file-upload").fileinput({
        uploadUrl: '#',
        language: "ru",
        showUpload: false,
        showCaption: false,
        showCancel: false,
        showRemove: false,
        showProgress: true,
        browseClass: "box-file",
        overwriteInitial: false,
        initialPreviewAsData: true,
        preferIconicZoomPreview: true,
        allowedFileExtensions: ['jpg', 'png', 'gif'],
    })

    // Маска для даты
    $('[data-toggle="datepicker"]').mask("99.99.9999")
    // bootstrap datepicker
    $('[data-toggle="datepicker"]').datepicker({
        autoHide: true,
        zIndex: 2048,
        language: 'ru-RU',
        format: 'dd.mm.yyyy'
    })

    // Закрытие текущего модального окна, открытие модального окна с хеша ссылки
    $('.js-modal').click(function (e) {
        var modalId = $(this.hash)
        $('.modal').modal('hide')
        setTimeout(function (e) {
            modalId.modal('show')
        }, 500)
        e.preventDefault()
    })

    // маска для номера телефона
    $('.mask-phone').mask("+7 (999) 999-99-99")
    // маска для времени
    $('.mask-time').mask("99:99")

    // DataTable
    if ($(".js-datatable").length > 0) {
        $('.js-datatable').DataTable({
            "autoWidth": false,
            "length": false,
            "filter": false,
            "searching": false,
            "bLengthChange": false,
            "pagingType": "simple_numbers",
            "info": false,
            "order": [],
            "bSort": false,
            "oLanguage": {
                "sUrl": "../libs/datatables/russian.lang"
            },
            "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center g-pagination"ip>>>'
        })
    }

    // Скрываем поля адреса если он совпадает с пропиской
    // $('.js-address').change(function() {
    //   	if ($(this).is(':checked')){
    //     	$('#address').addClass('d-n')
    //   } else {
    //     $('#address').removeClass('d-n')
    //   }
    // });

    // tooltip
    $('[data-toggle="tooltip"]').tooltip()

    // изменяем вид шапки при скролле
    $(window).scroll(function () {
        if ($(this).scrollTop() > 1) {
            $(".page-header").addClass('page-header_scroll')
        } else if ($(this).scrollTop() < 60) {
            $(".page-header").removeClass('page-header_scroll')
        }
    })
    if ($(this).scrollTop() > 1) {
        $(".page-header").addClass('page-header_scroll')
    } else if ($(this).scrollTop() < 60) {
        $(".page-header").removeClass('page-header_scroll')
    }

    // scroll to id
    $('.js-scroll-to').on('click', function (e) {
        e.preventDefault()
        var id = $(this).attr('href').replace('#', '')
        $('html, body').animate({
            scrollTop: $('#' + id).offset().top - $('.page-header').height()
        }, 1000)
        if ($('.page-header-menu').hasClass('show')) {
            $(".hamburger").trigger('click')
        }
    })

    // поднимаем label вверх
    $('.js-input').change(function () {
        // поднимаем label вверх
        if ($(this).val().length !== 0) {
            $(this).addClass('fullval')
        } else {
            $(this).removeClass('fullval')
        }
    })
    $('.js-input').each(function () {
        if ($(this).val().length !== 0) {
            $(this).addClass('fullval')
        } else {
            $(this).removeClass('fullval')
        }
    })

    // .resizer
    // var el = document.getElementById('resizer')
    // var resize = new Croppie(el, {
        // viewport: { width: 220, height: 220 },
        // boundary: { width: 230, height: 230 },
        // showZoomer: true,
        // enableResize: true,
        // enableOrientation: true,
        // mouseWheelZoom: 'ctrl'
    // })
})