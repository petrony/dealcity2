$(function() {
    $('input.phone').inputmask('+7 (999) 999-99-99');
    $('input.dotify').change(function() {
        var t = $(this);
        t.val(t.val().replace(',', '.'));
    });
    $('form .filter-dbl-click').click(function(e) {
        e.preventDefault();
        var t = $(this);
        t.prop('disabled', true);
        setTimeout(function() { t.prop('disabled', false) }, 3000);
        t.closest('form').submit();
    });

    $('.load-over-ajax').each(function(i, el) {
        loadOverAjax($(el));
    });

    var modal = $('#modal');
    modal.modal({ show: false });
    var container = modal.find('.modal-content');
    var body = $('body');

    body.on('click', '.ajax-post-and-reload-modal', function(e) {
        e.preventDefault();
        var t = $(this);
        var url = t.prop('href');
        var conf = t.data('confirm');
        if (conf && !confirm(conf)) return;
        $.post(url)
            .done(function(data) {
                modalHtml(data);
                modalForm(t);
            })
            .fail(function(data) {
                console.error(data);
                modalError();
            });
    });

    body.on('click', '.modal-open', function(e) {
        e.preventDefault();
        modalLoading();
        modal.modal('show');
        var t = $(this);
        var url = t.prop('href');
        $.get(url)
            .done(function(data) {
                modalHtml(data);
                modalForm(t);
            })
            .fail(function(data) {
                console.error(data);
                modalError();
            });
    });

    function modalForm(t) {
        var form = modal.find('form');
        var formElements = form.find(':input');
        form.submit(function(ee) {
            ee.preventDefault();
            // modalLoading();
            var action = form.prop('action') || url;
            var enctype = form.prop('enctype');
            var post;
            if (enctype === 'multipart/form-data') {
                post = $.post({
                    url: action,
                    data: new FormData(form[0]),
                    processData: false,
                    contentType: false,
                    cache: false
                });
            } else {
                post = $.post(action, form.serialize());
            }
            formElements.prop('disabled', true);
            post.done(function(data) {
                    if (data === '') {
                        modal.modal('hide');
                        loadOverAjax(t.closest('.load-over-ajax'));
                    } else {
                        modalHtml(data);
                        setTimeout(function() {
                            modalForm(t);
                        })
                    }
                })
                .fail(function(data) {
                    console.error(data);
                    modalError();
                })
                .always(function() {
                    formElements.prop('disabled', false);
                })
        });
    }

    function modalError() {
        container.html('<div class="modal-body"><div class="alert alert-danger">Произошла ошибка</div></div>');
        modal.modal('handleUpdate');
    }

    function modalLoading() {
        container.html('<div class="modal-body"><br><br><br><br><br>Идет загрузка ...<br><br><br><br><br><br></div>');
        modal.modal('handleUpdate');
    }

    function modalHtml(html) {
        container.html(html);
        modal.modal('handleUpdate');
        var form = modal.find('form');
        $.validator.unobtrusive.parse(form);
    }

    function loadOverAjax(t) {
        t.load(t.data('url'));
    }

    body.on('click', '.ajax-pos-item', function(e) {
        e.preventDefault();
        var t = $(this);
        var dir = t.data('dir');
        var url = t.prop('href');
        var tr = t.closest('tr');
        var prev = tr.prev();
        var next = tr.next();
        $.post(url)
            .done(function() {
                if (dir === "up" && prev.length) {
                    tr.after(prev);
                } 
                if (dir === "down" && next.length) {
                    next.after(tr);
                }
            })
            .fail(function() {
                loadOverAjax(t.closest('.load-over-ajax'));
            });
    });
});