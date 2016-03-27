/*
 * jQuery Form Styler v1.7.4
 * https://github.com/Dimox/jQueryFormStyler
 *
 * Copyright 2012-2015 Dimox (http://dimox.name/)
 * Released under the MIT license.
 *
 * Date: 2015.09.12
 *
 */

;(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function($) {

	'use strict';

	var pluginName = 'styler',
			defaults = {
				wrapper: 'form',
				idSuffix: '-styler',
				filePlaceholder: 'Файл не выбран',
				fileBrowse: 'Обзор...',
				fileNumber: 'Выбрано файлов: %s',
				selectPlaceholder: 'Выберите...',
				selectSearch: false,
				selectSearchLimit: 10,
				selectSearchNotFound: 'Совпадений не найдено',
				selectSearchPlaceholder: 'Поиск...',
				selectVisibleOptions: 0,
				singleSelectzIndex: '100',
				selectSmartPositioning: true,
				onSelectOpened: function() {},
				onSelectClosed: function() {},
				onFormStyled: function() {}
			};

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	Plugin.prototype = {

		// инициализация
		init: function() {

			var el = $(this.element);
			var opt = this.options;

			var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/i) && !navigator.userAgent.match(/(Windows\sPhone)/i)) ? true : false;
			var Android = (navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/(Windows\sPhone)/i)) ? true : false;

			function Attributes() {
				var id = '',
						title = '',
						classes = '',
						dataList = '';
				if (el.attr('id') !== undefined && el.attr('id') !== '') id = ' id="' + el.attr('id') + opt.idSuffix + '"';
				if (el.attr('title') !== undefined && el.attr('title') !== '') title = ' title="' + el.attr('title') + '"';
				if (el.attr('class') !== undefined && el.attr('class') !== '') classes = ' ' + el.attr('class');
				var data = el.data();
				for (var i in data) {
					if (data[i] !== '' && i !== '_styler') dataList += ' data-' + i + '="' + data[i] + '"';
				}
				id += dataList;
				this.id = id;
				this.title = title;
				this.classes = classes;
			}

			// checkbox
			if (el.is(':checkbox')) {

				var checkboxOutput = function() {

					var att = new Attributes();
					var checkbox = $('<div' + att.id + ' class="jq-checkbox' + att.classes + '"' + att.title + '><div class="jq-checkbox__div"></div></div>');

					// прячем оригинальный чекбокс
					el.css({
						position: 'absolute',
						zIndex: '-1',
						opacity: 0,
						margin: 0,
						padding: 0
					}).after(checkbox).prependTo(checkbox);

					checkbox.attr('unselectable', 'on').css({
						'-webkit-user-select': 'none',
						'-moz-user-select': 'none',
						'-ms-user-select': 'none',
						'-o-user-select': 'none',
						'user-select': 'none',
						display: 'inline-block',
						position: 'relative',
						overflow: 'hidden'
					});

					if (el.is(':checked')) checkbox.addClass('checked');
					if (el.is(':disabled')) checkbox.addClass('disabled');

					// клик на псевдочекбокс
					checkbox.click(function(e) {
						e.preventDefault();
						if (!checkbox.is('.disabled')) {
							if (el.is(':checked')) {
								el.prop('checked', false);
								checkbox.removeClass('checked');
							} else {
								el.prop('checked', true);
								checkbox.addClass('checked');
							}
							el.focus().change();
						}
					});
					// клик на label
					el.closest('label').add('label[for="' + el.attr('id') + '"]').on('click.styler', function(e) {
						if (!$(e.target).is('a') && !$(e.target).closest(checkbox).length) {
							checkbox.triggerHandler('click');
							e.preventDefault();
						}
					});
					// переключение по Space или Enter
					el.on('change.styler', function() {
						if (el.is(':checked')) checkbox.addClass('checked');
						else checkbox.removeClass('checked');
					})
					// чтобы переключался чекбокс, который находится в теге label
					.on('keydown.styler', function(e) {
						if (e.which == 32) checkbox.click();
					})
					.on('focus.styler', function() {
						if (!checkbox.is('.disabled')) checkbox.addClass('focused');
					})
					.on('blur.styler', function() {
						checkbox.removeClass('focused');
					});

				}; // end checkboxOutput()

				checkboxOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
					el.off('.styler').parent().before(el).remove();
					checkboxOutput();
				});

			// end checkbox

			// radio
			} else if (el.is(':radio')) {

				var radioOutput = function() {

					var att = new Attributes();
					var radio = $('<div' + att.id + ' class="jq-radio' + att.classes + '"' + att.title + '><div class="jq-radio__div"></div></div>');

					// прячем оригинальную радиокнопку
					el.css({
						position: 'absolute',
						zIndex: '-1',
						opacity: 0,
						margin: 0,
						padding: 0
					}).after(radio).prependTo(radio);

					radio.attr('unselectable', 'on').css({
						'-webkit-user-select': 'none',
						'-moz-user-select': 'none',
						'-ms-user-select': 'none',
						'-o-user-select': 'none',
						'user-select': 'none',
						display: 'inline-block',
						position: 'relative'
					});

					if (el.is(':checked')) radio.addClass('checked');
					if (el.is(':disabled')) radio.addClass('disabled');

					// клик на псевдорадиокнопке
					radio.click(function(e) {
						e.preventDefault();
						if (!radio.is('.disabled')) {
							radio.closest(opt.wrapper).find('input[name="' + el.attr('name') + '"]').prop('checked', false).parent().removeClass('checked');
							el.prop('checked', true).parent().addClass('checked');
							el.focus().change();
						}
					});
					// клик на label
					el.closest('label').add('label[for="' + el.attr('id') + '"]').on('click.styler', function(e) {
						if (!$(e.target).is('a') && !$(e.target).closest(radio).length) {
							radio.triggerHandler('click');
							e.preventDefault();
						}
					});
					// переключение стрелками
					el.on('change.styler', function() {
						el.parent().addClass('checked');
					})
					.on('focus.styler', function() {
						if (!radio.is('.disabled')) radio.addClass('focused');
					})
					.on('blur.styler', function() {
						radio.removeClass('focused');
					});

				}; // end radioOutput()

				radioOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
					el.off('.styler').parent().before(el).remove();
					radioOutput();
				});

			// end radio

			// file
			} else if (el.is(':file')) {

				// прячем оригинальное поле
				el.css({
					position: 'absolute',
					top: 0,
					right: 0,
					width: '100%',
					height: '100%',
					opacity: 0,
					margin: 0,
					padding: 0
				});

				var fileOutput = function() {

					var att = new Attributes();
					var placeholder = el.data('placeholder');
					if (placeholder === undefined) placeholder = opt.filePlaceholder;
					var browse = el.data('browse');
					if (browse === undefined || browse === '') browse = opt.fileBrowse;
					var file = $('<div' + att.id + ' class="jq-file' + att.classes + '"' + att.title + ' style="display: inline-block; position: relative; overflow: hidden"></div>');
					var name = $('<div class="jq-file__name">' + placeholder + '</div>').appendTo(file);
					$('<div class="jq-file__browse">' + browse + '</div>').appendTo(file);
					el.after(file).appendTo(file);

					if (el.is(':disabled')) file.addClass('disabled');

					el.on('change.styler', function() {
						var value = el.val();
						if (el.is('[multiple]')) {
							value = '';
							var files = el[0].files.length;
							if (files > 0) {
								var number = el.data('number');
								if (number === undefined) number = opt.fileNumber;
								number = number.replace('%s', files);
								value = number;
							}
						}
						name.text(value.replace(/.+[\\\/]/, ''));
						if (value === '') {
							name.text(placeholder);
							file.removeClass('changed');
						} else {
							file.addClass('changed');
						}
					})
					.on('focus.styler', function() {
						file.addClass('focused');
					})
					.on('blur.styler', function() {
						file.removeClass('focused');
					})
					.on('click.styler', function() {
						file.removeClass('focused');
					});

				}; // end fileOutput()

				fileOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').parent().before(el).remove();
					fileOutput();
				});

			// end file

			} else if (el.is('input[type="number"]')) {

				var numberOutput = function() {

					var number = $('<div class="jq-number"><div class="jq-number__spin minus"></div><div class="jq-number__spin plus"></div></div>');
					el.after(number).prependTo(number).wrap('<div class="jq-number__field"></div>');

					if (el.is(':disabled')) number.addClass('disabled');

					var min,
							max,
							step,
							timeout = null,
							interval = null;
					if (el.attr('min') !== undefined) min = el.attr('min');
					if (el.attr('max') !== undefined) max = el.attr('max');
					if (el.attr('step') !== undefined && $.isNumeric(el.attr('step')))
						step = Number(el.attr('step'));
					else
						step = Number(1);

					var changeValue = function(spin) {
						var value = el.val(),
								newValue;
						if (!$.isNumeric(value)) {
							value = 0;
							el.val('0');
						}
						if (spin.is('.minus')) {
							newValue = parseInt(value, 10) - step;
							if (step > 0) newValue = Math.ceil(newValue / step) * step;
						} else if (spin.is('.plus')) {
							newValue = parseInt(value, 10) + step;
							if (step > 0) newValue = Math.floor(newValue / step) * step;
						}
						if ($.isNumeric(min) && $.isNumeric(max)) {
							if (newValue >= min && newValue <= max) el.val(newValue);
						} else if ($.isNumeric(min) && !$.isNumeric(max)) {
							if (newValue >= min) el.val(newValue);
						} else if (!$.isNumeric(min) && $.isNumeric(max)) {
							if (newValue <= max) el.val(newValue);
						} else {
							el.val(newValue);
						}
					};

					if (!number.is('.disabled')) {
						number.on('mousedown', 'div.jq-number__spin', function() {
							var spin = $(this);
							changeValue(spin);
							timeout = setTimeout(function(){
								interval = setInterval(function(){ changeValue(spin); }, 40);
							}, 350);
						}).on('mouseup mouseout', 'div.jq-number__spin', function() {
							clearTimeout(timeout);
							clearInterval(interval);
						});
						el.on('focus.styler', function() {
							number.addClass('focused');
						})
						.on('blur.styler', function() {
							number.removeClass('focused');
						});
					}

				}; // end numberOutput()

				numberOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').closest('.jq-number').before(el).remove();
					numberOutput();
				});

			// end number

			// select
			} else if (el.is('select')) {

				var selectboxOutput = function() {

					// запрещаем прокрутку страницы при прокрутке селекта
					function preventScrolling(selector) {
						selector.off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {
							var scrollTo = null;
							if (e.type == 'mousewheel') { scrollTo = (e.originalEvent.wheelDelta * -1); }
							else if (e.type == 'DOMMouseScroll') { scrollTo = 40 * e.originalEvent.detail; }
							if (scrollTo) {
								e.stopPropagation();
								e.preventDefault();
								$(this).scrollTop(scrollTo + $(this).scrollTop());
							}
						});
					}

					var option = $('option', el);
					var list = '';
					// формируем список селекта
					function makeList() {
						for (var i = 0; i < option.length; i++) {
							var op = option.eq(i);
							var li = '',
									liClass = '',
									liClasses = '',
									id = '',
									title = '',
									dataList = '',
									optionClass = '',
									optgroupClass = '',
									dataJqfsClass = '';
							var disabled = 'disabled';
							var selDis = 'selected sel disabled';
							if (op.prop('selected')) liClass = 'selected sel';
							if (op.is(':disabled')) liClass = disabled;
							if (op.is(':selected:disabled')) liClass = selDis;
							if (op.attr('id') !== undefined && op.attr('id') !== '') id = ' id="' + op.attr('id') + opt.idSuffix + '"';
							if (op.attr('title') !== undefined && option.attr('title') !== '') title = ' title="' + op.attr('title') + '"';
							if (op.attr('class') !== undefined) {
								optionClass = ' ' + op.attr('class');
								dataJqfsClass = ' data-jqfs-class="' + op.attr('class') + '"';
							}

							var data = op.data();
							for (var k in data) {
								if (data[k] !== '') dataList += ' data-' + k + '="' + data[k] + '"';
							}

							if ( (liClass + optionClass) !== '' )   liClasses = ' class="' + liClass + optionClass + '"';
							li = '<li' + dataJqfsClass + dataList + liClasses + title + id + '>'+ op.html() +'</li>';

							// если есть optgroup
							if (op.parent().is('optgroup')) {
								if (op.parent().attr('class') !== undefined) optgroupClass = ' ' + op.parent().attr('class');
								li = '<li' + dataJqfsClass + dataList + ' class="' + liClass + optionClass + ' option' + optgroupClass + '"' + title + id + '>'+ op.html() +'</li>';
								if (op.is(':first-child')) {
									li = '<li class="optgroup' + optgroupClass + '">' + op.parent().attr('label') + '</li>' + li;
								}
							}

							list += li;
						}
					} // end makeList()

					// одиночный селект
					function doSelect() {
						var att = new Attributes();

						var searchHTML = '';
						var selectPlaceholder = el.data('placeholder');
						var selectSearch = el.data('search');
						var selectSearchLimit = el.data('search-limit');
						var selectSearchNotFound = el.data('search-not-found');
						var selectSearchPlaceholder = el.data('search-placeholder');
						var singleSelectzIndex = el.data('z-index');
						var selectSmartPositioning = el.data('smart-positioning');

						if (selectPlaceholder === undefined) selectPlaceholder = opt.selectPlaceholder;
						if (selectSearch === undefined || selectSearch === '') selectSearch = opt.selectSearch;
						if (selectSearchLimit === undefined || selectSearchLimit === '') selectSearchLimit = opt.selectSearchLimit;
						if (selectSearchNotFound === undefined || selectSearchNotFound === '') selectSearchNotFound = opt.selectSearchNotFound;
						if (selectSearchPlaceholder === undefined) selectSearchPlaceholder = opt.selectSearchPlaceholder;
						if (singleSelectzIndex === undefined || singleSelectzIndex === '') singleSelectzIndex = opt.singleSelectzIndex;
						if (selectSmartPositioning === undefined || selectSmartPositioning === '') selectSmartPositioning = opt.selectSmartPositioning;

						var selectbox =
							$('<div' + att.id + ' class="jq-selectbox jqselect' + att.classes + '" style="display: inline-block; position: relative; z-index:' + singleSelectzIndex + '">' +
									'<div class="jq-selectbox__select"' + att.title + ' style="position: relative">' +
										'<div class="jq-selectbox__select-text"></div>' +
										'<div class="jq-selectbox__trigger"><div class="jq-selectbox__trigger-arrow"></div></div>' +
									'</div>' +
								'</div>');

						el.css({margin: 0, padding: 0}).after(selectbox).prependTo(selectbox);

						var divSelect = $('div.jq-selectbox__select', selectbox);
						var divText = $('div.jq-selectbox__select-text', selectbox);
						var optionSelected = option.filter(':selected');

						makeList();

						if (selectSearch) searchHTML =
							'<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="' + selectSearchPlaceholder + '"></div>' +
							'<div class="jq-selectbox__not-found">' + selectSearchNotFound + '</div>';
						var dropdown =
							$('<div class="jq-selectbox__dropdown" style="position: absolute">' +
									searchHTML +
									'<ul style="position: relative; list-style: none; overflow: auto; overflow-x: hidden">' + list + '</ul>' +
								'</div>');
						selectbox.append(dropdown);
						var ul = $('ul', dropdown);
						var li = $('li', dropdown);
						var search = $('input', dropdown);
						var notFound = $('div.jq-selectbox__not-found', dropdown).hide();
						if (li.length < selectSearchLimit) search.parent().hide();

						// показываем опцию по умолчанию
						// если 1-я опция пустая и выбрана по умолчанию, то показываем плейсхолдер
						if (el.val() === '') {
							divText.text(selectPlaceholder).addClass('placeholder');
						} else {
							divText.text(optionSelected.text());
						}

						// определяем самый широкий пункт селекта
						var liWidthInner = 0,
								liWidth = 0;
						li.each(function() {
							var l = $(this);
							l.css({'display': 'inline-block'});
							if (l.innerWidth() > liWidthInner) {
								liWidthInner = l.innerWidth();
								liWidth = l.width();
							}
							l.css({'display': ''});
						});

						// подстраиваем ширину свернутого селекта в зависимости
						// от ширины плейсхолдера или самого широкого пункта
						if (divText.is('.placeholder') && (divText.width() > liWidthInner)) {
							divText.width(divText.width());
						} else {
							var selClone = selectbox.clone().appendTo('body').width('auto');
							var selCloneWidth = selClone.outerWidth();
							selClone.remove();
							if (selCloneWidth == selectbox.outerWidth()) {
								divText.width(liWidth);
							}
						}

						// подстраиваем ширину выпадающего списка в зависимости от самого широкого пункта
						if (liWidthInner > selectbox.width()) dropdown.width(liWidthInner);

						// прячем 1-ю пустую опцию, если она есть и если атрибут data-placeholder не пустой
						// если все же нужно, чтобы первая пустая опция отображалась, то указываем у селекта: data-placeholder=""
						if (option.first().text() === '' && el.data('placeholder') !== '') {
							li.first().hide();
						}

						// прячем оригинальный селект
						el.css({
							position: 'absolute',
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							opacity: 0
						});

						var selectHeight = selectbox.outerHeight();
						var searchHeight = search.outerHeight();
						var isMaxHeight = ul.css('max-height');
						var liSelected = li.filter('.selected');
						if (liSelected.length < 1) li.first().addClass('selected sel');
						if (li.data('li-height') === undefined) li.data('li-height', li.outerHeight());
						var position = dropdown.css('top');
						if (dropdown.css('left') == 'auto') dropdown.css({left: 0});
						if (dropdown.css('top') == 'auto') dropdown.css({top: selectHeight});
						dropdown.hide();

						// если выбран не дефолтный пункт
						if (liSelected.length) {
							// добавляем класс, показывающий изменение селекта
							if (option.first().text() != optionSelected.text()) {
								selectbox.addClass('changed');
							}
							// передаем селекту класс выбранного пункта
							selectbox.data('jqfs-class', liSelected.data('jqfs-class'));
							selectbox.addClass(liSelected.data('jqfs-class'));
						}

						// если селект неактивный
						if (el.is(':disabled')) {
							selectbox.addClass('disabled');
							return false;
						}

						// при клике на псевдоселекте
						divSelect.click(function() {

							// колбек при закрытии селекта
							if ($('div.jq-selectbox').filter('.opened').length) {
								opt.onSelectClosed.call($('div.jq-selectbox').filter('.opened'));
							}

							el.focus();

							// если iOS, то не показываем выпадающий список,
							// т.к. отображается нативный и неизвестно, как его спрятать
							if (iOS) return;

							// умное позиционирование
							var win = $(window);
							var liHeight = li.data('li-height');
							var topOffset = selectbox.offset().top;
							var bottomOffset = win.height() - selectHeight - (topOffset - win.scrollTop());
							var visible = el.data('visible-options');
							if (visible === undefined || visible === '') visible = opt.selectVisibleOptions;
							var minHeight = liHeight * 5;
							var newHeight = liHeight * visible;
							if (visible > 0 && visible < 6) minHeight = newHeight;
							if (visible === 0) newHeight = 'auto';

							var dropDown = function() {
								dropdown.height('auto').css({bottom: 'auto', top: position});
								var maxHeightBottom = function() {
									ul.css('max-height', Math.floor((bottomOffset - 20 - searchHeight) / liHeight) * liHeight);
								};
								maxHeightBottom();
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
								if (bottomOffset < (dropdown.outerHeight() + 20)) {
									maxHeightBottom();
								}
							};

							var dropUp = function() {
								dropdown.height('auto').css({top: 'auto', bottom: position});
								var maxHeightTop = function() {
									ul.css('max-height', Math.floor((topOffset - win.scrollTop() - 20 - searchHeight) / liHeight) * liHeight);
								};
								maxHeightTop();
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
								if ((topOffset - win.scrollTop() - 20) < (dropdown.outerHeight() + 20)) {
									maxHeightTop();
								}
							};

							if (selectSmartPositioning === true || selectSmartPositioning === 1) {
								// раскрытие вниз
								if (bottomOffset > (minHeight + searchHeight + 20)) {
									dropDown();
									selectbox.removeClass('dropup').addClass('dropdown');
								// раскрытие вверх
								} else {
									dropUp();
									selectbox.removeClass('dropdown').addClass('dropup');
								}
							} else if (selectSmartPositioning === false || selectSmartPositioning === 0) {
								// раскрытие вниз
								if (bottomOffset > (minHeight + searchHeight + 20)) {
									dropDown();
									selectbox.removeClass('dropup').addClass('dropdown');
								}
							}

							// если выпадающий список выходит за правый край окна браузера,
							// то меняем позиционирование с левого на правое
							if (selectbox.offset().left + dropdown.outerWidth() > win.width()) {
								dropdown.css({left: 'auto', right: 0});
							}
							// конец умного позиционирования

							$('div.jqselect').css({zIndex: (singleSelectzIndex - 1)}).removeClass('opened');
							selectbox.css({zIndex: singleSelectzIndex});
							if (dropdown.is(':hidden')) {
								$('div.jq-selectbox__dropdown:visible').hide();
								dropdown.show();
								selectbox.addClass('opened focused');
								// колбек при открытии селекта
								opt.onSelectOpened.call(selectbox);
							} else {
								dropdown.hide();
								selectbox.removeClass('opened dropup dropdown');
								// колбек при закрытии селекта
								if ($('div.jq-selectbox').filter('.opened').length) {
									opt.onSelectClosed.call(selectbox);
								}
							}

							// поисковое поле
							if (search.length) {
								search.val('').keyup();
								notFound.hide();
								search.keyup(function() {
									var query = $(this).val();
									li.each(function() {
										if (!$(this).html().match(new RegExp('.*?' + query + '.*?', 'i'))) {
											$(this).hide();
										} else {
											$(this).show();
										}
									});
									// прячем 1-ю пустую опцию
									if (option.first().text() === '' && el.data('placeholder') !== '') {
										li.first().hide();
									}
									if (li.filter(':visible').length < 1) {
										notFound.show();
									} else {
										notFound.hide();
									}
								});
							}

							// прокручиваем до выбранного пункта при открытии списка
							if (li.filter('.selected').length) {
								if (el.val() === '') {
									ul.scrollTop(0);
								} else {
									// если нечетное количество видимых пунктов,
									// то высоту пункта делим пополам для последующего расчета
									if ( (ul.innerHeight() / liHeight) % 2 !== 0 ) liHeight = liHeight / 2;
									ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() / 2 + liHeight);
								}
							}

							preventScrolling(ul);

						}); // end divSelect.click()

						// при наведении курсора на пункт списка
						li.hover(function() {
							$(this).siblings().removeClass('selected');
						});
						var selectedText = li.filter('.selected').text();

						// при клике на пункт списка
						li.filter(':not(.disabled):not(.optgroup)').click(function() {
							el.focus();
							var t = $(this);
							var liText = t.text();
							if (!t.is('.selected')) {
								var index = t.index();
								index -= t.prevAll('.optgroup').length;
								t.addClass('selected sel').siblings().removeClass('selected sel');
								option.prop('selected', false).eq(index).prop('selected', true);
								selectedText = liText;
								divText.text(liText);

								// передаем селекту класс выбранного пункта
								if (selectbox.data('jqfs-class')) selectbox.removeClass(selectbox.data('jqfs-class'));
								selectbox.data('jqfs-class', t.data('jqfs-class'));
								selectbox.addClass(t.data('jqfs-class'));

								el.change();
							}
							dropdown.hide();
							selectbox.removeClass('opened dropup dropdown');
							// колбек при закрытии селекта
							opt.onSelectClosed.call(selectbox);

						});
						dropdown.mouseout(function() {
							$('li.sel', dropdown).addClass('selected');
						});

						// изменение селекта
						el.on('change.styler', function() {
							divText.text(option.filter(':selected').text()).removeClass('placeholder');
							li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
							// добавляем класс, показывающий изменение селекта
							if (option.first().text() != li.filter('.selected').text()) {
								selectbox.addClass('changed');
							} else {
								selectbox.removeClass('changed');
							}
						})
						.on('focus.styler', function() {
							selectbox.addClass('focused');
							$('div.jqselect').not('.focused').removeClass('opened dropup dropdown').find('div.jq-selectbox__dropdown').hide();
						})
						.on('blur.styler', function() {
							selectbox.removeClass('focused');
						})
						// изменение селекта с клавиатуры
						.on('keydown.styler keyup.styler', function(e) {
							var liHeight = li.data('li-height');
							if (el.val() === '') {
								divText.text(selectPlaceholder).addClass('placeholder');
							} else {
								divText.text(option.filter(':selected').text());
							}
							li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
							// вверх, влево, Page Up, Home
							if (e.which == 38 || e.which == 37 || e.which == 33 || e.which == 36) {
								if (el.val() === '') {
									ul.scrollTop(0);
								} else {
									ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
								}
							}
							// вниз, вправо, Page Down, End
							if (e.which == 40 || e.which == 39 || e.which == 34 || e.which == 35) {
								ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() + liHeight);
							}
							// закрываем выпадающий список при нажатии Enter
							if (e.which == 13) {
								e.preventDefault();
								dropdown.hide();
								selectbox.removeClass('opened dropup dropdown');
								// колбек при закрытии селекта
								opt.onSelectClosed.call(selectbox);
							}
						}).on('keydown.styler', function(e) {
							// открываем выпадающий список при нажатии Space
							if (e.which == 32) {
								e.preventDefault();
								divSelect.click();
							}
						});

						// прячем выпадающий список при клике за пределами селекта
						if (!onDocumentClick.registered) {
							$(document).on('click', onDocumentClick);
							onDocumentClick.registered = true;
						}

					} // end doSelect()

					// мультиселект
					function doMultipleSelect() {
						var att = new Attributes();
						var selectbox = $('<div' + att.id + ' class="jq-select-multiple jqselect' + att.classes + '"' + att.title + ' style="display: inline-block; position: relative"></div>');

						el.css({margin: 0, padding: 0}).after(selectbox);

						makeList();
						selectbox.append('<ul>' + list + '</ul>');
						var ul = $('ul', selectbox).css({
							'position': 'relative',
							'overflow-x': 'hidden',
							'-webkit-overflow-scrolling': 'touch'
						});
						var li = $('li', selectbox).attr('unselectable', 'on');
						var size = el.attr('size');
						var ulHeight = ul.outerHeight();
						var liHeight = li.outerHeight();
						if (size !== undefined && size > 0) {
							ul.css({'height': liHeight * size});
						} else {
							ul.css({'height': liHeight * 4});
						}
						if (ulHeight > selectbox.height()) {
							ul.css('overflowY', 'scroll');
							preventScrolling(ul);
							// прокручиваем до выбранного пункта
							if (li.filter('.selected').length) {
								ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
							}
						}

						// прячем оригинальный селект
						el.prependTo(selectbox).css({
							position: 'absolute',
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							opacity: 0
						});

						// если селект неактивный
						if (el.is(':disabled')) {
							selectbox.addClass('disabled');
							option.each(function() {
								if ($(this).is(':selected')) li.eq($(this).index()).addClass('selected');
							});

						// если селект активный
						} else {

							// при клике на пункт списка
							li.filter(':not(.disabled):not(.optgroup)').click(function(e) {
								el.focus();
								var clkd = $(this);
								if(!e.ctrlKey && !e.metaKey) clkd.addClass('selected');
								if(!e.shiftKey) clkd.addClass('first');
								if(!e.ctrlKey && !e.metaKey && !e.shiftKey) clkd.siblings().removeClass('selected first');

								// выделение пунктов при зажатом Ctrl
								if(e.ctrlKey || e.metaKey) {
									if (clkd.is('.selected')) clkd.removeClass('selected first');
										else clkd.addClass('selected first');
									clkd.siblings().removeClass('first');
								}

								// выделение пунктов при зажатом Shift
								if(e.shiftKey) {
									var prev = false,
											next = false;
									clkd.siblings().removeClass('selected').siblings('.first').addClass('selected');
									clkd.prevAll().each(function() {
										if ($(this).is('.first')) prev = true;
									});
									clkd.nextAll().each(function() {
										if ($(this).is('.first')) next = true;
									});
									if (prev) {
										clkd.prevAll().each(function() {
											if ($(this).is('.selected')) return false;
												else $(this).not('.disabled, .optgroup').addClass('selected');
										});
									}
									if (next) {
										clkd.nextAll().each(function() {
											if ($(this).is('.selected')) return false;
												else $(this).not('.disabled, .optgroup').addClass('selected');
										});
									}
									if (li.filter('.selected').length == 1) clkd.addClass('first');
								}

								// отмечаем выбранные мышью
								option.prop('selected', false);
								li.filter('.selected').each(function() {
									var t = $(this);
									var index = t.index();
									if (t.is('.option')) index -= t.prevAll('.optgroup').length;
									option.eq(index).prop('selected', true);
								});
								el.change();

							});

							// отмечаем выбранные с клавиатуры
							option.each(function(i) {
								$(this).data('optionIndex', i);
							});
							el.on('change.styler', function() {
								li.removeClass('selected');
								var arrIndexes = [];
								option.filter(':selected').each(function() {
									arrIndexes.push($(this).data('optionIndex'));
								});
								li.not('.optgroup').filter(function(i) {
									return $.inArray(i, arrIndexes) > -1;
								}).addClass('selected');
							})
							.on('focus.styler', function() {
								selectbox.addClass('focused');
							})
							.on('blur.styler', function() {
								selectbox.removeClass('focused');
							});

							// прокручиваем с клавиатуры
							if (ulHeight > selectbox.height()) {
								el.on('keydown.styler', function(e) {
									// вверх, влево, PageUp
									if (e.which == 38 || e.which == 37 || e.which == 33) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - liHeight);
									}
									// вниз, вправо, PageDown
									if (e.which == 40 || e.which == 39 || e.which == 34) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected:last').position().top - ul.innerHeight() + liHeight * 2);
									}
								});
							}

						}
					} // end doMultipleSelect()

					if (el.is('[multiple]')) {

						// если Android или iOS, то мультиселект не стилизуем
						// причина для Android - в стилизованном селекте нет возможности выбрать несколько пунктов
						// причина для iOS - в стилизованном селекте неправильно отображаются выбранные пункты
						if (Android || iOS) return;

						doMultipleSelect();
					} else {
						doSelect();
					}

				}; // end selectboxOutput()

				selectboxOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').parent().before(el).remove();
					selectboxOutput();
				});

			// end select

			// reset
			} else if (el.is(':reset')) {
				el.on('click', function() {
					setTimeout(function() {
						el.closest(opt.wrapper).find('input, select').trigger('refresh');
					}, 1);
				});
			} // end reset

		}, // init: function()

		// деструктор
		destroy: function() {

			var el = $(this.element);

			if (el.is(':checkbox') || el.is(':radio')) {
				el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
				el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
			} else if (el.is('input[type="number"]')) {
				el.removeData('_' + pluginName).off('.styler refresh').closest('.jq-number').before(el).remove();
			} else if (el.is(':file') || el.is('select')) {
				el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
			}

		} // destroy: function()

	}; // Plugin.prototype

	$.fn[pluginName] = function(options) {
		var args = arguments;
		if (options === undefined || typeof options === 'object') {
			this.each(function() {
				if (!$.data(this, '_' + pluginName)) {
					$.data(this, '_' + pluginName, new Plugin(this, options));
				}
			})
			// колбек после выполнения плагина
			.promise()
			.done(function() {
				var opt = $(this[0]).data('_' + pluginName);
				if (opt) opt.options.onFormStyled.call();
			});
			return this;
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			var returns;
			this.each(function() {
				var instance = $.data(this, '_' + pluginName);
				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
			});
			return returns !== undefined ? returns : this;
		}
	};

	// прячем выпадающий список при клике за пределами селекта
	function onDocumentClick(e) {
		// e.target.nodeName != 'OPTION' - добавлено для обхода бага в Opera на движке Presto
		// (при изменении селекта с клавиатуры срабатывает событие onclick)
		if (!$(e.target).parents().hasClass('jq-selectbox') && e.target.nodeName != 'OPTION') {
			if ($('div.jq-selectbox.opened').length) {
				var selectbox = $('div.jq-selectbox.opened'),
						search = $('div.jq-selectbox__search input', selectbox),
						dropdown = $('div.jq-selectbox__dropdown', selectbox),
						opt = selectbox.find('select').data('_' + pluginName).options;

				// колбек при закрытии селекта
				opt.onSelectClosed.call(selectbox);

				if (search.length) search.val('').keyup();
				dropdown.hide().find('li.sel').addClass('selected');
				selectbox.removeClass('focused opened dropup dropdown');
			}
		}
	}
	onDocumentClick.registered = false;

}));
/* jQuery Form Styler v1.7.4 | (c) Dimox | https://github.com/Dimox/jQueryFormStyler */
(function(b){"function"===typeof define&&define.amd?define(["jquery"],b):"object"===typeof exports?module.exports=b(require("jquery")):b(jQuery)})(function(b){function z(c,a){this.element=c;this.options=b.extend({},N,a);this.init()}function G(c){if(!b(c.target).parents().hasClass("jq-selectbox")&&"OPTION"!=c.target.nodeName&&b("div.jq-selectbox.opened").length){c=b("div.jq-selectbox.opened");var a=b("div.jq-selectbox__search input",c),f=b("div.jq-selectbox__dropdown",c);c.find("select").data("_"+
h).options.onSelectClosed.call(c);a.length&&a.val("").keyup();f.hide().find("li.sel").addClass("selected");c.removeClass("focused opened dropup dropdown")}}var h="styler",N={wrapper:"form",idSuffix:"-styler",filePlaceholder:"\u0424\u0430\u0439\u043b \u043d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d",fileBrowse:"\u041e\u0431\u0437\u043e\u0440...",fileNumber:"\u0412\u044b\u0431\u0440\u0430\u043d\u043e \u0444\u0430\u0439\u043b\u043e\u0432: %s",selectPlaceholder:"\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435...",
selectSearch:!1,selectSearchLimit:10,selectSearchNotFound:"\u0421\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",selectSearchPlaceholder:"\u041f\u043e\u0438\u0441\u043a...",selectVisibleOptions:0,singleSelectzIndex:"100",selectSmartPositioning:!0,onSelectOpened:function(){},onSelectClosed:function(){},onFormStyled:function(){}};z.prototype={init:function(){function c(){var b="",d="",c="",e="";void 0!==a.attr("id")&&""!==a.attr("id")&&
(b=' id="'+a.attr("id")+f.idSuffix+'"');void 0!==a.attr("title")&&""!==a.attr("title")&&(d=' title="'+a.attr("title")+'"');void 0!==a.attr("class")&&""!==a.attr("class")&&(c=" "+a.attr("class"));var l=a.data(),t;for(t in l)""!==l[t]&&"_styler"!==t&&(e+=" data-"+t+'="'+l[t]+'"');this.id=b+e;this.title=d;this.classes=c}var a=b(this.element),f=this.options,y=navigator.userAgent.match(/(iPad|iPhone|iPod)/i)&&!navigator.userAgent.match(/(Windows\sPhone)/i)?!0:!1,h=navigator.userAgent.match(/Android/i)&&
!navigator.userAgent.match(/(Windows\sPhone)/i)?!0:!1;if(a.is(":checkbox")){var z=function(){var f=new c,d=b("<div"+f.id+' class="jq-checkbox'+f.classes+'"'+f.title+'><div class="jq-checkbox__div"></div></div>');a.css({position:"absolute",zIndex:"-1",opacity:0,margin:0,padding:0}).after(d).prependTo(d);d.attr("unselectable","on").css({"-webkit-user-select":"none","-moz-user-select":"none","-ms-user-select":"none","-o-user-select":"none","user-select":"none",display:"inline-block",position:"relative",
overflow:"hidden"});a.is(":checked")&&d.addClass("checked");a.is(":disabled")&&d.addClass("disabled");d.click(function(b){b.preventDefault();d.is(".disabled")||(a.is(":checked")?(a.prop("checked",!1),d.removeClass("checked")):(a.prop("checked",!0),d.addClass("checked")),a.focus().change())});a.closest("label").add('label[for="'+a.attr("id")+'"]').on("click.styler",function(a){b(a.target).is("a")||b(a.target).closest(d).length||(d.triggerHandler("click"),a.preventDefault())});a.on("change.styler",
function(){a.is(":checked")?d.addClass("checked"):d.removeClass("checked")}).on("keydown.styler",function(a){32==a.which&&d.click()}).on("focus.styler",function(){d.is(".disabled")||d.addClass("focused")}).on("blur.styler",function(){d.removeClass("focused")})};z();a.on("refresh",function(){a.closest("label").add('label[for="'+a.attr("id")+'"]').off(".styler");a.off(".styler").parent().before(a).remove();z()})}else if(a.is(":radio")){var B=function(){var x=new c,d=b("<div"+x.id+' class="jq-radio'+
x.classes+'"'+x.title+'><div class="jq-radio__div"></div></div>');a.css({position:"absolute",zIndex:"-1",opacity:0,margin:0,padding:0}).after(d).prependTo(d);d.attr("unselectable","on").css({"-webkit-user-select":"none","-moz-user-select":"none","-ms-user-select":"none","-o-user-select":"none","user-select":"none",display:"inline-block",position:"relative"});a.is(":checked")&&d.addClass("checked");a.is(":disabled")&&d.addClass("disabled");d.click(function(b){b.preventDefault();d.is(".disabled")||
(d.closest(f.wrapper).find('input[name="'+a.attr("name")+'"]').prop("checked",!1).parent().removeClass("checked"),a.prop("checked",!0).parent().addClass("checked"),a.focus().change())});a.closest("label").add('label[for="'+a.attr("id")+'"]').on("click.styler",function(a){b(a.target).is("a")||b(a.target).closest(d).length||(d.triggerHandler("click"),a.preventDefault())});a.on("change.styler",function(){a.parent().addClass("checked")}).on("focus.styler",function(){d.is(".disabled")||d.addClass("focused")}).on("blur.styler",
function(){d.removeClass("focused")})};B();a.on("refresh",function(){a.closest("label").add('label[for="'+a.attr("id")+'"]').off(".styler");a.off(".styler").parent().before(a).remove();B()})}else if(a.is(":file")){a.css({position:"absolute",top:0,right:0,width:"100%",height:"100%",opacity:0,margin:0,padding:0});var C=function(){var x=new c,d=a.data("placeholder");void 0===d&&(d=f.filePlaceholder);var A=a.data("browse");if(void 0===A||""===A)A=f.fileBrowse;var e=b("<div"+x.id+' class="jq-file'+x.classes+
'"'+x.title+' style="display: inline-block; position: relative; overflow: hidden"></div>'),l=b('<div class="jq-file__name">'+d+"</div>").appendTo(e);b('<div class="jq-file__browse">'+A+"</div>").appendTo(e);a.after(e).appendTo(e);a.is(":disabled")&&e.addClass("disabled");a.on("change.styler",function(){var b=a.val();if(a.is("[multiple]")){var b="",c=a[0].files.length;0<c&&(b=a.data("number"),void 0===b&&(b=f.fileNumber),b=b.replace("%s",c))}l.text(b.replace(/.+[\\\/]/,""));""===b?(l.text(d),e.removeClass("changed")):
e.addClass("changed")}).on("focus.styler",function(){e.addClass("focused")}).on("blur.styler",function(){e.removeClass("focused")}).on("click.styler",function(){e.removeClass("focused")})};C();a.on("refresh",function(){a.off(".styler").parent().before(a).remove();C()})}else if(a.is('input[type="number"]')){var D=function(){var c=b('<div class="jq-number"><div class="jq-number__spin minus"></div><div class="jq-number__spin plus"></div></div>');a.after(c).prependTo(c).wrap('<div class="jq-number__field"></div>');
a.is(":disabled")&&c.addClass("disabled");var d,f,e,l=null,t=null;void 0!==a.attr("min")&&(d=a.attr("min"));void 0!==a.attr("max")&&(f=a.attr("max"));e=void 0!==a.attr("step")&&b.isNumeric(a.attr("step"))?Number(a.attr("step")):Number(1);var K=function(s){var c=a.val(),k;b.isNumeric(c)||(c=0,a.val("0"));s.is(".minus")?(k=parseInt(c,10)-e,0<e&&(k=Math.ceil(k/e)*e)):s.is(".plus")&&(k=parseInt(c,10)+e,0<e&&(k=Math.floor(k/e)*e));b.isNumeric(d)&&b.isNumeric(f)?k>=d&&k<=f&&a.val(k):b.isNumeric(d)&&!b.isNumeric(f)?
k>=d&&a.val(k):!b.isNumeric(d)&&b.isNumeric(f)?k<=f&&a.val(k):a.val(k)};c.is(".disabled")||(c.on("mousedown","div.jq-number__spin",function(){var a=b(this);K(a);l=setTimeout(function(){t=setInterval(function(){K(a)},40)},350)}).on("mouseup mouseout","div.jq-number__spin",function(){clearTimeout(l);clearInterval(t)}),a.on("focus.styler",function(){c.addClass("focused")}).on("blur.styler",function(){c.removeClass("focused")}))};D();a.on("refresh",function(){a.off(".styler").closest(".jq-number").before(a).remove();
D()})}else if(a.is("select")){var M=function(){function x(a){a.off("mousewheel DOMMouseScroll").on("mousewheel DOMMouseScroll",function(a){var c=null;"mousewheel"==a.type?c=-1*a.originalEvent.wheelDelta:"DOMMouseScroll"==a.type&&(c=40*a.originalEvent.detail);c&&(a.stopPropagation(),a.preventDefault(),b(this).scrollTop(c+b(this).scrollTop()))})}function d(){for(var a=0;a<l.length;a++){var b=l.eq(a),c="",d="",e=c="",u="",p="",v="",w="",g="";b.prop("selected")&&(d="selected sel");b.is(":disabled")&&
(d="disabled");b.is(":selected:disabled")&&(d="selected sel disabled");void 0!==b.attr("id")&&""!==b.attr("id")&&(e=' id="'+b.attr("id")+f.idSuffix+'"');void 0!==b.attr("title")&&""!==l.attr("title")&&(u=' title="'+b.attr("title")+'"');void 0!==b.attr("class")&&(v=" "+b.attr("class"),g=' data-jqfs-class="'+b.attr("class")+'"');var h=b.data(),r;for(r in h)""!==h[r]&&(p+=" data-"+r+'="'+h[r]+'"');""!==d+v&&(c=' class="'+d+v+'"');c="<li"+g+p+c+u+e+">"+b.html()+"</li>";b.parent().is("optgroup")&&(void 0!==
b.parent().attr("class")&&(w=" "+b.parent().attr("class")),c="<li"+g+p+' class="'+d+v+" option"+w+'"'+u+e+">"+b.html()+"</li>",b.is(":first-child")&&(c='<li class="optgroup'+w+'">'+b.parent().attr("label")+"</li>"+c));t+=c}}function z(){var e=new c,s="",H=a.data("placeholder"),k=a.data("search"),h=a.data("search-limit"),u=a.data("search-not-found"),p=a.data("search-placeholder"),v=a.data("z-index"),w=a.data("smart-positioning");void 0===H&&(H=f.selectPlaceholder);if(void 0===k||""===k)k=f.selectSearch;
if(void 0===h||""===h)h=f.selectSearchLimit;if(void 0===u||""===u)u=f.selectSearchNotFound;void 0===p&&(p=f.selectSearchPlaceholder);if(void 0===v||""===v)v=f.singleSelectzIndex;if(void 0===w||""===w)w=f.selectSmartPositioning;var g=b("<div"+e.id+' class="jq-selectbox jqselect'+e.classes+'" style="display: inline-block; position: relative; z-index:'+v+'"><div class="jq-selectbox__select"'+e.title+' style="position: relative"><div class="jq-selectbox__select-text"></div><div class="jq-selectbox__trigger"><div class="jq-selectbox__trigger-arrow"></div></div></div></div>');
a.css({margin:0,padding:0}).after(g).prependTo(g);var L=b("div.jq-selectbox__select",g),r=b("div.jq-selectbox__select-text",g),e=l.filter(":selected");d();k&&(s='<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="'+p+'"></div><div class="jq-selectbox__not-found">'+u+"</div>");var m=b('<div class="jq-selectbox__dropdown" style="position: absolute">'+s+'<ul style="position: relative; list-style: none; overflow: auto; overflow-x: hidden">'+t+"</ul></div>");g.append(m);
var q=b("ul",m),n=b("li",m),E=b("input",m),A=b("div.jq-selectbox__not-found",m).hide();n.length<h&&E.parent().hide();""===a.val()?r.text(H).addClass("placeholder"):r.text(e.text());var F=0,B=0;n.each(function(){var a=b(this);a.css({display:"inline-block"});a.innerWidth()>F&&(F=a.innerWidth(),B=a.width());a.css({display:""})});r.is(".placeholder")&&r.width()>F?r.width(r.width()):(s=g.clone().appendTo("body").width("auto"),k=s.outerWidth(),s.remove(),k==g.outerWidth()&&r.width(B));F>g.width()&&m.width(F);
""===l.first().text()&&""!==a.data("placeholder")&&n.first().hide();a.css({position:"absolute",left:0,top:0,width:"100%",height:"100%",opacity:0});var C=g.outerHeight(),I=E.outerHeight(),J=q.css("max-height"),s=n.filter(".selected");1>s.length&&n.first().addClass("selected sel");void 0===n.data("li-height")&&n.data("li-height",n.outerHeight());var D=m.css("top");"auto"==m.css("left")&&m.css({left:0});"auto"==m.css("top")&&m.css({top:C});m.hide();s.length&&(l.first().text()!=e.text()&&g.addClass("changed"),
g.data("jqfs-class",s.data("jqfs-class")),g.addClass(s.data("jqfs-class")));if(a.is(":disabled"))return g.addClass("disabled"),!1;L.click(function(){b("div.jq-selectbox").filter(".opened").length&&f.onSelectClosed.call(b("div.jq-selectbox").filter(".opened"));a.focus();if(!y){var c=b(window),d=n.data("li-height"),e=g.offset().top,k=c.height()-C-(e-c.scrollTop()),p=a.data("visible-options");if(void 0===p||""===p)p=f.selectVisibleOptions;var s=5*d,h=d*p;0<p&&6>p&&(s=h);0===p&&(h="auto");var p=function(){m.height("auto").css({bottom:"auto",
top:D});var a=function(){q.css("max-height",Math.floor((k-20-I)/d)*d)};a();q.css("max-height",h);"none"!=J&&q.css("max-height",J);k<m.outerHeight()+20&&a()},r=function(){m.height("auto").css({top:"auto",bottom:D});var a=function(){q.css("max-height",Math.floor((e-c.scrollTop()-20-I)/d)*d)};a();q.css("max-height",h);"none"!=J&&q.css("max-height",J);e-c.scrollTop()-20<m.outerHeight()+20&&a()};!0===w||1===w?k>s+I+20?(p(),g.removeClass("dropup").addClass("dropdown")):(r(),g.removeClass("dropdown").addClass("dropup")):
(!1===w||0===w)&&k>s+I+20&&(p(),g.removeClass("dropup").addClass("dropdown"));g.offset().left+m.outerWidth()>c.width()&&m.css({left:"auto",right:0});b("div.jqselect").css({zIndex:v-1}).removeClass("opened");g.css({zIndex:v});m.is(":hidden")?(b("div.jq-selectbox__dropdown:visible").hide(),m.show(),g.addClass("opened focused"),f.onSelectOpened.call(g)):(m.hide(),g.removeClass("opened dropup dropdown"),b("div.jq-selectbox").filter(".opened").length&&f.onSelectClosed.call(g));E.length&&(E.val("").keyup(),
A.hide(),E.keyup(function(){var c=b(this).val();n.each(function(){b(this).html().match(RegExp(".*?"+c+".*?","i"))?b(this).show():b(this).hide()});""===l.first().text()&&""!==a.data("placeholder")&&n.first().hide();1>n.filter(":visible").length?A.show():A.hide()}));n.filter(".selected").length&&(""===a.val()?q.scrollTop(0):(0!==q.innerHeight()/d%2&&(d/=2),q.scrollTop(q.scrollTop()+n.filter(".selected").position().top-q.innerHeight()/2+d)));x(q)}});n.hover(function(){b(this).siblings().removeClass("selected")});
n.filter(".selected").text();n.filter(":not(.disabled):not(.optgroup)").click(function(){a.focus();var c=b(this),d=c.text();if(!c.is(".selected")){var e=c.index(),e=e-c.prevAll(".optgroup").length;c.addClass("selected sel").siblings().removeClass("selected sel");l.prop("selected",!1).eq(e).prop("selected",!0);r.text(d);g.data("jqfs-class")&&g.removeClass(g.data("jqfs-class"));g.data("jqfs-class",c.data("jqfs-class"));g.addClass(c.data("jqfs-class"));a.change()}m.hide();g.removeClass("opened dropup dropdown");
f.onSelectClosed.call(g)});m.mouseout(function(){b("li.sel",m).addClass("selected")});a.on("change.styler",function(){r.text(l.filter(":selected").text()).removeClass("placeholder");n.removeClass("selected sel").not(".optgroup").eq(a[0].selectedIndex).addClass("selected sel");l.first().text()!=n.filter(".selected").text()?g.addClass("changed"):g.removeClass("changed")}).on("focus.styler",function(){g.addClass("focused");b("div.jqselect").not(".focused").removeClass("opened dropup dropdown").find("div.jq-selectbox__dropdown").hide()}).on("blur.styler",
function(){g.removeClass("focused")}).on("keydown.styler keyup.styler",function(b){var c=n.data("li-height");""===a.val()?r.text(H).addClass("placeholder"):r.text(l.filter(":selected").text());n.removeClass("selected sel").not(".optgroup").eq(a[0].selectedIndex).addClass("selected sel");if(38==b.which||37==b.which||33==b.which||36==b.which)""===a.val()?q.scrollTop(0):q.scrollTop(q.scrollTop()+n.filter(".selected").position().top);40!=b.which&&39!=b.which&&34!=b.which&&35!=b.which||q.scrollTop(q.scrollTop()+
n.filter(".selected").position().top-q.innerHeight()+c);13==b.which&&(b.preventDefault(),m.hide(),g.removeClass("opened dropup dropdown"),f.onSelectClosed.call(g))}).on("keydown.styler",function(a){32==a.which&&(a.preventDefault(),L.click())});G.registered||(b(document).on("click",G),G.registered=!0)}function e(){var e=new c,f=b("<div"+e.id+' class="jq-select-multiple jqselect'+e.classes+'"'+e.title+' style="display: inline-block; position: relative"></div>');a.css({margin:0,padding:0}).after(f);
d();f.append("<ul>"+t+"</ul>");var h=b("ul",f).css({position:"relative","overflow-x":"hidden","-webkit-overflow-scrolling":"touch"}),k=b("li",f).attr("unselectable","on"),e=a.attr("size"),y=h.outerHeight(),u=k.outerHeight();void 0!==e&&0<e?h.css({height:u*e}):h.css({height:4*u});y>f.height()&&(h.css("overflowY","scroll"),x(h),k.filter(".selected").length&&h.scrollTop(h.scrollTop()+k.filter(".selected").position().top));a.prependTo(f).css({position:"absolute",left:0,top:0,width:"100%",height:"100%",
opacity:0});if(a.is(":disabled"))f.addClass("disabled"),l.each(function(){b(this).is(":selected")&&k.eq(b(this).index()).addClass("selected")});else if(k.filter(":not(.disabled):not(.optgroup)").click(function(c){a.focus();var d=b(this);c.ctrlKey||c.metaKey||d.addClass("selected");c.shiftKey||d.addClass("first");c.ctrlKey||(c.metaKey||c.shiftKey)||d.siblings().removeClass("selected first");if(c.ctrlKey||c.metaKey)d.is(".selected")?d.removeClass("selected first"):d.addClass("selected first"),d.siblings().removeClass("first");
if(c.shiftKey){var e=!1,f=!1;d.siblings().removeClass("selected").siblings(".first").addClass("selected");d.prevAll().each(function(){b(this).is(".first")&&(e=!0)});d.nextAll().each(function(){b(this).is(".first")&&(f=!0)});e&&d.prevAll().each(function(){if(b(this).is(".selected"))return!1;b(this).not(".disabled, .optgroup").addClass("selected")});f&&d.nextAll().each(function(){if(b(this).is(".selected"))return!1;b(this).not(".disabled, .optgroup").addClass("selected")});1==k.filter(".selected").length&&
d.addClass("first")}l.prop("selected",!1);k.filter(".selected").each(function(){var a=b(this),c=a.index();a.is(".option")&&(c-=a.prevAll(".optgroup").length);l.eq(c).prop("selected",!0)});a.change()}),l.each(function(a){b(this).data("optionIndex",a)}),a.on("change.styler",function(){k.removeClass("selected");var a=[];l.filter(":selected").each(function(){a.push(b(this).data("optionIndex"))});k.not(".optgroup").filter(function(c){return-1<b.inArray(c,a)}).addClass("selected")}).on("focus.styler",function(){f.addClass("focused")}).on("blur.styler",
function(){f.removeClass("focused")}),y>f.height())a.on("keydown.styler",function(a){38!=a.which&&37!=a.which&&33!=a.which||h.scrollTop(h.scrollTop()+k.filter(".selected").position().top-u);40!=a.which&&39!=a.which&&34!=a.which||h.scrollTop(h.scrollTop()+k.filter(".selected:last").position().top-h.innerHeight()+2*u)})}var l=b("option",a),t="";a.is("[multiple]")?h||y||e():z()};M();a.on("refresh",function(){a.off(".styler").parent().before(a).remove();M()})}else if(a.is(":reset"))a.on("click",function(){setTimeout(function(){a.closest(f.wrapper).find("input, select").trigger("refresh")},
1)})},destroy:function(){var c=b(this.element);c.is(":checkbox")||c.is(":radio")?(c.removeData("_"+h).off(".styler refresh").removeAttr("style").parent().before(c).remove(),c.closest("label").add('label[for="'+c.attr("id")+'"]').off(".styler")):c.is('input[type="number"]')?c.removeData("_"+h).off(".styler refresh").closest(".jq-number").before(c).remove():(c.is(":file")||c.is("select"))&&c.removeData("_"+h).off(".styler refresh").removeAttr("style").parent().before(c).remove()}};b.fn[h]=function(c){var a=
arguments;if(void 0===c||"object"===typeof c)return this.each(function(){b.data(this,"_"+h)||b.data(this,"_"+h,new z(this,c))}).promise().done(function(){var a=b(this[0]).data("_"+h);a&&a.options.onFormStyled.call()}),this;if("string"===typeof c&&"_"!==c[0]&&"init"!==c){var f;this.each(function(){var y=b.data(this,"_"+h);y instanceof z&&"function"===typeof y[c]&&(f=y[c].apply(y,Array.prototype.slice.call(a,1)))});return void 0!==f?f:this}};G.registered=!1});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5mb3Jtc3R5bGVyLmpzIiwianF1ZXJ5LmZvcm1zdHlsZXIubWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdGlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhc3NldHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBqUXVlcnkgRm9ybSBTdHlsZXIgdjEuNy40XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9EaW1veC9qUXVlcnlGb3JtU3R5bGVyXHJcbiAqXHJcbiAqIENvcHlyaWdodCAyMDEyLTIwMTUgRGltb3ggKGh0dHA6Ly9kaW1veC5uYW1lLylcclxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKlxyXG4gKiBEYXRlOiAyMDE1LjA5LjEyXHJcbiAqXHJcbiAqL1xyXG5cclxuOyhmdW5jdGlvbihmYWN0b3J5KSB7XHJcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG5cdFx0Ly8gQU1EXHJcblx0XHRkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XHJcblx0fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuXHRcdC8vIENvbW1vbkpTXHJcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRmYWN0b3J5KGpRdWVyeSk7XHJcblx0fVxyXG59KGZ1bmN0aW9uKCQpIHtcclxuXHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHR2YXIgcGx1Z2luTmFtZSA9ICdzdHlsZXInLFxyXG5cdFx0XHRkZWZhdWx0cyA9IHtcclxuXHRcdFx0XHR3cmFwcGVyOiAnZm9ybScsXHJcblx0XHRcdFx0aWRTdWZmaXg6ICctc3R5bGVyJyxcclxuXHRcdFx0XHRmaWxlUGxhY2Vob2xkZXI6ICfQpNCw0LnQuyDQvdC1INCy0YvQsdGA0LDQvScsXHJcblx0XHRcdFx0ZmlsZUJyb3dzZTogJ9Ce0LHQt9C+0YAuLi4nLFxyXG5cdFx0XHRcdGZpbGVOdW1iZXI6ICfQktGL0LHRgNCw0L3QviDRhNCw0LnQu9C+0LI6ICVzJyxcclxuXHRcdFx0XHRzZWxlY3RQbGFjZWhvbGRlcjogJ9CS0YvQsdC10YDQuNGC0LUuLi4nLFxyXG5cdFx0XHRcdHNlbGVjdFNlYXJjaDogZmFsc2UsXHJcblx0XHRcdFx0c2VsZWN0U2VhcmNoTGltaXQ6IDEwLFxyXG5cdFx0XHRcdHNlbGVjdFNlYXJjaE5vdEZvdW5kOiAn0KHQvtCy0L/QsNC00LXQvdC40Lkg0L3QtSDQvdCw0LnQtNC10L3QvicsXHJcblx0XHRcdFx0c2VsZWN0U2VhcmNoUGxhY2Vob2xkZXI6ICfQn9C+0LjRgdC6Li4uJyxcclxuXHRcdFx0XHRzZWxlY3RWaXNpYmxlT3B0aW9uczogMCxcclxuXHRcdFx0XHRzaW5nbGVTZWxlY3R6SW5kZXg6ICcxMDAnLFxyXG5cdFx0XHRcdHNlbGVjdFNtYXJ0UG9zaXRpb25pbmc6IHRydWUsXHJcblx0XHRcdFx0b25TZWxlY3RPcGVuZWQ6IGZ1bmN0aW9uKCkge30sXHJcblx0XHRcdFx0b25TZWxlY3RDbG9zZWQ6IGZ1bmN0aW9uKCkge30sXHJcblx0XHRcdFx0b25Gb3JtU3R5bGVkOiBmdW5jdGlvbigpIHt9XHJcblx0XHRcdH07XHJcblxyXG5cdGZ1bmN0aW9uIFBsdWdpbihlbGVtZW50LCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHRcdHRoaXMuaW5pdCgpO1xyXG5cdH1cclxuXHJcblx0UGx1Z2luLnByb3RvdHlwZSA9IHtcclxuXHJcblx0XHQvLyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjRj1xyXG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR2YXIgZWwgPSAkKHRoaXMuZWxlbWVudCk7XHJcblx0XHRcdHZhciBvcHQgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0XHR2YXIgaU9TID0gKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kKS9pKSAmJiAhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKFdpbmRvd3NcXHNQaG9uZSkvaSkpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cdFx0XHR2YXIgQW5kcm9pZCA9IChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpICYmICFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oV2luZG93c1xcc1Bob25lKS9pKSkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBBdHRyaWJ1dGVzKCkge1xyXG5cdFx0XHRcdHZhciBpZCA9ICcnLFxyXG5cdFx0XHRcdFx0XHR0aXRsZSA9ICcnLFxyXG5cdFx0XHRcdFx0XHRjbGFzc2VzID0gJycsXHJcblx0XHRcdFx0XHRcdGRhdGFMaXN0ID0gJyc7XHJcblx0XHRcdFx0aWYgKGVsLmF0dHIoJ2lkJykgIT09IHVuZGVmaW5lZCAmJiBlbC5hdHRyKCdpZCcpICE9PSAnJykgaWQgPSAnIGlkPVwiJyArIGVsLmF0dHIoJ2lkJykgKyBvcHQuaWRTdWZmaXggKyAnXCInO1xyXG5cdFx0XHRcdGlmIChlbC5hdHRyKCd0aXRsZScpICE9PSB1bmRlZmluZWQgJiYgZWwuYXR0cigndGl0bGUnKSAhPT0gJycpIHRpdGxlID0gJyB0aXRsZT1cIicgKyBlbC5hdHRyKCd0aXRsZScpICsgJ1wiJztcclxuXHRcdFx0XHRpZiAoZWwuYXR0cignY2xhc3MnKSAhPT0gdW5kZWZpbmVkICYmIGVsLmF0dHIoJ2NsYXNzJykgIT09ICcnKSBjbGFzc2VzID0gJyAnICsgZWwuYXR0cignY2xhc3MnKTtcclxuXHRcdFx0XHR2YXIgZGF0YSA9IGVsLmRhdGEoKTtcclxuXHRcdFx0XHRmb3IgKHZhciBpIGluIGRhdGEpIHtcclxuXHRcdFx0XHRcdGlmIChkYXRhW2ldICE9PSAnJyAmJiBpICE9PSAnX3N0eWxlcicpIGRhdGFMaXN0ICs9ICcgZGF0YS0nICsgaSArICc9XCInICsgZGF0YVtpXSArICdcIic7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlkICs9IGRhdGFMaXN0O1xyXG5cdFx0XHRcdHRoaXMuaWQgPSBpZDtcclxuXHRcdFx0XHR0aGlzLnRpdGxlID0gdGl0bGU7XHJcblx0XHRcdFx0dGhpcy5jbGFzc2VzID0gY2xhc3NlcztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gY2hlY2tib3hcclxuXHRcdFx0aWYgKGVsLmlzKCc6Y2hlY2tib3gnKSkge1xyXG5cclxuXHRcdFx0XHR2YXIgY2hlY2tib3hPdXRwdXQgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdFx0XHR2YXIgYXR0ID0gbmV3IEF0dHJpYnV0ZXMoKTtcclxuXHRcdFx0XHRcdHZhciBjaGVja2JveCA9ICQoJzxkaXYnICsgYXR0LmlkICsgJyBjbGFzcz1cImpxLWNoZWNrYm94JyArIGF0dC5jbGFzc2VzICsgJ1wiJyArIGF0dC50aXRsZSArICc+PGRpdiBjbGFzcz1cImpxLWNoZWNrYm94X19kaXZcIj48L2Rpdj48L2Rpdj4nKTtcclxuXHJcblx0XHRcdFx0XHQvLyDQv9GA0Y/Rh9C10Lwg0L7RgNC40LPQuNC90LDQu9GM0L3Ri9C5INGH0LXQutCx0L7QutGBXHJcblx0XHRcdFx0XHRlbC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuXHRcdFx0XHRcdFx0ekluZGV4OiAnLTEnLFxyXG5cdFx0XHRcdFx0XHRvcGFjaXR5OiAwLFxyXG5cdFx0XHRcdFx0XHRtYXJnaW46IDAsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmc6IDBcclxuXHRcdFx0XHRcdH0pLmFmdGVyKGNoZWNrYm94KS5wcmVwZW5kVG8oY2hlY2tib3gpO1xyXG5cclxuXHRcdFx0XHRcdGNoZWNrYm94LmF0dHIoJ3Vuc2VsZWN0YWJsZScsICdvbicpLmNzcyh7XHJcblx0XHRcdFx0XHRcdCctd2Via2l0LXVzZXItc2VsZWN0JzogJ25vbmUnLFxyXG5cdFx0XHRcdFx0XHQnLW1vei11c2VyLXNlbGVjdCc6ICdub25lJyxcclxuXHRcdFx0XHRcdFx0Jy1tcy11c2VyLXNlbGVjdCc6ICdub25lJyxcclxuXHRcdFx0XHRcdFx0Jy1vLXVzZXItc2VsZWN0JzogJ25vbmUnLFxyXG5cdFx0XHRcdFx0XHQndXNlci1zZWxlY3QnOiAnbm9uZScsXHJcblx0XHRcdFx0XHRcdGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuXHRcdFx0XHRcdFx0b3ZlcmZsb3c6ICdoaWRkZW4nXHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZWwuaXMoJzpjaGVja2VkJykpIGNoZWNrYm94LmFkZENsYXNzKCdjaGVja2VkJyk7XHJcblx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSBjaGVja2JveC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcblx0XHRcdFx0XHQvLyDQutC70LjQuiDQvdCwINC/0YHQtdCy0LTQvtGH0LXQutCx0L7QutGBXHJcblx0XHRcdFx0XHRjaGVja2JveC5jbGljayhmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFjaGVja2JveC5pcygnLmRpc2FibGVkJykpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZWwuaXMoJzpjaGVja2VkJykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGVsLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGVja2JveC5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRlbC5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGVja2JveC5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbC5mb2N1cygpLmNoYW5nZSgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdC8vINC60LvQuNC6INC90LAgbGFiZWxcclxuXHRcdFx0XHRcdGVsLmNsb3Nlc3QoJ2xhYmVsJykuYWRkKCdsYWJlbFtmb3I9XCInICsgZWwuYXR0cignaWQnKSArICdcIl0nKS5vbignY2xpY2suc3R5bGVyJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoISQoZS50YXJnZXQpLmlzKCdhJykgJiYgISQoZS50YXJnZXQpLmNsb3Nlc3QoY2hlY2tib3gpLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdGNoZWNrYm94LnRyaWdnZXJIYW5kbGVyKCdjbGljaycpO1xyXG5cdFx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LXQvdC40LUg0L/QviBTcGFjZSDQuNC70LggRW50ZXJcclxuXHRcdFx0XHRcdGVsLm9uKCdjaGFuZ2Uuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGlmIChlbC5pcygnOmNoZWNrZWQnKSkgY2hlY2tib3guYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBjaGVja2JveC5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC8vINGH0YLQvtCx0Ysg0L/QtdGA0LXQutC70Y7Rh9Cw0LvRgdGPINGH0LXQutCx0L7QutGBLCDQutC+0YLQvtGA0YvQuSDQvdCw0YXQvtC00LjRgtGB0Y8g0LIg0YLQtdCz0LUgbGFiZWxcclxuXHRcdFx0XHRcdC5vbigna2V5ZG93bi5zdHlsZXInLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDMyKSBjaGVja2JveC5jbGljaygpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGlmICghY2hlY2tib3guaXMoJy5kaXNhYmxlZCcpKSBjaGVja2JveC5hZGRDbGFzcygnZm9jdXNlZCcpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5vbignYmx1ci5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0Y2hlY2tib3gucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR9OyAvLyBlbmQgY2hlY2tib3hPdXRwdXQoKVxyXG5cclxuXHRcdFx0XHRjaGVja2JveE91dHB1dCgpO1xyXG5cclxuXHRcdFx0XHQvLyDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9GA0Lgg0LTQuNC90LDQvNC40YfQtdGB0LrQvtC8INC40LfQvNC10L3QtdC90LjQuFxyXG5cdFx0XHRcdGVsLm9uKCdyZWZyZXNoJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRlbC5jbG9zZXN0KCdsYWJlbCcpLmFkZCgnbGFiZWxbZm9yPVwiJyArIGVsLmF0dHIoJ2lkJykgKyAnXCJdJykub2ZmKCcuc3R5bGVyJyk7XHJcblx0XHRcdFx0XHRlbC5vZmYoJy5zdHlsZXInKS5wYXJlbnQoKS5iZWZvcmUoZWwpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0Y2hlY2tib3hPdXRwdXQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIGVuZCBjaGVja2JveFxyXG5cclxuXHRcdFx0Ly8gcmFkaW9cclxuXHRcdFx0fSBlbHNlIGlmIChlbC5pcygnOnJhZGlvJykpIHtcclxuXHJcblx0XHRcdFx0dmFyIHJhZGlvT3V0cHV0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGF0dCA9IG5ldyBBdHRyaWJ1dGVzKCk7XHJcblx0XHRcdFx0XHR2YXIgcmFkaW8gPSAkKCc8ZGl2JyArIGF0dC5pZCArICcgY2xhc3M9XCJqcS1yYWRpbycgKyBhdHQuY2xhc3NlcyArICdcIicgKyBhdHQudGl0bGUgKyAnPjxkaXYgY2xhc3M9XCJqcS1yYWRpb19fZGl2XCI+PC9kaXY+PC9kaXY+Jyk7XHJcblxyXG5cdFx0XHRcdFx0Ly8g0L/RgNGP0YfQtdC8INC+0YDQuNCz0LjQvdCw0LvRjNC90YPRjiDRgNCw0LTQuNC+0LrQvdC+0L/QutGDXHJcblx0XHRcdFx0XHRlbC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuXHRcdFx0XHRcdFx0ekluZGV4OiAnLTEnLFxyXG5cdFx0XHRcdFx0XHRvcGFjaXR5OiAwLFxyXG5cdFx0XHRcdFx0XHRtYXJnaW46IDAsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmc6IDBcclxuXHRcdFx0XHRcdH0pLmFmdGVyKHJhZGlvKS5wcmVwZW5kVG8ocmFkaW8pO1xyXG5cclxuXHRcdFx0XHRcdHJhZGlvLmF0dHIoJ3Vuc2VsZWN0YWJsZScsICdvbicpLmNzcyh7XHJcblx0XHRcdFx0XHRcdCctd2Via2l0LXVzZXItc2VsZWN0JzogJ25vbmUnLFxyXG5cdFx0XHRcdFx0XHQnLW1vei11c2VyLXNlbGVjdCc6ICdub25lJyxcclxuXHRcdFx0XHRcdFx0Jy1tcy11c2VyLXNlbGVjdCc6ICdub25lJyxcclxuXHRcdFx0XHRcdFx0Jy1vLXVzZXItc2VsZWN0JzogJ25vbmUnLFxyXG5cdFx0XHRcdFx0XHQndXNlci1zZWxlY3QnOiAnbm9uZScsXHJcblx0XHRcdFx0XHRcdGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogJ3JlbGF0aXZlJ1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGVsLmlzKCc6Y2hlY2tlZCcpKSByYWRpby5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0aWYgKGVsLmlzKCc6ZGlzYWJsZWQnKSkgcmFkaW8uYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG5cdFx0XHRcdFx0Ly8g0LrQu9C40Log0L3QsCDQv9GB0LXQstC00L7RgNCw0LTQuNC+0LrQvdC+0L/QutC1XHJcblx0XHRcdFx0XHRyYWRpby5jbGljayhmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFyYWRpby5pcygnLmRpc2FibGVkJykpIHtcclxuXHRcdFx0XHRcdFx0XHRyYWRpby5jbG9zZXN0KG9wdC53cmFwcGVyKS5maW5kKCdpbnB1dFtuYW1lPVwiJyArIGVsLmF0dHIoJ25hbWUnKSArICdcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0ZWwucHJvcCgnY2hlY2tlZCcsIHRydWUpLnBhcmVudCgpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0ZWwuZm9jdXMoKS5jaGFuZ2UoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHQvLyDQutC70LjQuiDQvdCwIGxhYmVsXHJcblx0XHRcdFx0XHRlbC5jbG9zZXN0KCdsYWJlbCcpLmFkZCgnbGFiZWxbZm9yPVwiJyArIGVsLmF0dHIoJ2lkJykgKyAnXCJdJykub24oJ2NsaWNrLnN0eWxlcicsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCEkKGUudGFyZ2V0KS5pcygnYScpICYmICEkKGUudGFyZ2V0KS5jbG9zZXN0KHJhZGlvKS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRyYWRpby50cmlnZ2VySGFuZGxlcignY2xpY2snKTtcclxuXHRcdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C10L3QuNC1INGB0YLRgNC10LvQutCw0LzQuFxyXG5cdFx0XHRcdFx0ZWwub24oJ2NoYW5nZS5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0ZWwucGFyZW50KCkuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2ZvY3VzLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXJhZGlvLmlzKCcuZGlzYWJsZWQnKSkgcmFkaW8uYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2JsdXIuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJhZGlvLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0fTsgLy8gZW5kIHJhZGlvT3V0cHV0KClcclxuXHJcblx0XHRcdFx0cmFkaW9PdXRwdXQoKTtcclxuXHJcblx0XHRcdFx0Ly8g0L7QsdC90L7QstC70LXQvdC40LUg0L/RgNC4INC00LjQvdCw0LzQuNGH0LXRgdC60L7QvCDQuNC30LzQtdC90LXQvdC40LhcclxuXHRcdFx0XHRlbC5vbigncmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0ZWwuY2xvc2VzdCgnbGFiZWwnKS5hZGQoJ2xhYmVsW2Zvcj1cIicgKyBlbC5hdHRyKCdpZCcpICsgJ1wiXScpLm9mZignLnN0eWxlcicpO1xyXG5cdFx0XHRcdFx0ZWwub2ZmKCcuc3R5bGVyJykucGFyZW50KCkuYmVmb3JlKGVsKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdHJhZGlvT3V0cHV0KCk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBlbmQgcmFkaW9cclxuXHJcblx0XHRcdC8vIGZpbGVcclxuXHRcdFx0fSBlbHNlIGlmIChlbC5pcygnOmZpbGUnKSkge1xyXG5cclxuXHRcdFx0XHQvLyDQv9GA0Y/Rh9C10Lwg0L7RgNC40LPQuNC90LDQu9GM0L3QvtC1INC/0L7Qu9C1XHJcblx0XHRcdFx0ZWwuY3NzKHtcclxuXHRcdFx0XHRcdHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG5cdFx0XHRcdFx0dG9wOiAwLFxyXG5cdFx0XHRcdFx0cmlnaHQ6IDAsXHJcblx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxyXG5cdFx0XHRcdFx0aGVpZ2h0OiAnMTAwJScsXHJcblx0XHRcdFx0XHRvcGFjaXR5OiAwLFxyXG5cdFx0XHRcdFx0bWFyZ2luOiAwLFxyXG5cdFx0XHRcdFx0cGFkZGluZzogMFxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR2YXIgZmlsZU91dHB1dCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0XHRcdHZhciBhdHQgPSBuZXcgQXR0cmlidXRlcygpO1xyXG5cdFx0XHRcdFx0dmFyIHBsYWNlaG9sZGVyID0gZWwuZGF0YSgncGxhY2Vob2xkZXInKTtcclxuXHRcdFx0XHRcdGlmIChwbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSBwbGFjZWhvbGRlciA9IG9wdC5maWxlUGxhY2Vob2xkZXI7XHJcblx0XHRcdFx0XHR2YXIgYnJvd3NlID0gZWwuZGF0YSgnYnJvd3NlJyk7XHJcblx0XHRcdFx0XHRpZiAoYnJvd3NlID09PSB1bmRlZmluZWQgfHwgYnJvd3NlID09PSAnJykgYnJvd3NlID0gb3B0LmZpbGVCcm93c2U7XHJcblx0XHRcdFx0XHR2YXIgZmlsZSA9ICQoJzxkaXYnICsgYXR0LmlkICsgJyBjbGFzcz1cImpxLWZpbGUnICsgYXR0LmNsYXNzZXMgKyAnXCInICsgYXR0LnRpdGxlICsgJyBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1ibG9jazsgcG9zaXRpb246IHJlbGF0aXZlOyBvdmVyZmxvdzogaGlkZGVuXCI+PC9kaXY+Jyk7XHJcblx0XHRcdFx0XHR2YXIgbmFtZSA9ICQoJzxkaXYgY2xhc3M9XCJqcS1maWxlX19uYW1lXCI+JyArIHBsYWNlaG9sZGVyICsgJzwvZGl2PicpLmFwcGVuZFRvKGZpbGUpO1xyXG5cdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpxLWZpbGVfX2Jyb3dzZVwiPicgKyBicm93c2UgKyAnPC9kaXY+JykuYXBwZW5kVG8oZmlsZSk7XHJcblx0XHRcdFx0XHRlbC5hZnRlcihmaWxlKS5hcHBlbmRUbyhmaWxlKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSBmaWxlLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0XHRcdGVsLm9uKCdjaGFuZ2Uuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHZhciB2YWx1ZSA9IGVsLnZhbCgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZWwuaXMoJ1ttdWx0aXBsZV0nKSkge1xyXG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gJyc7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGZpbGVzID0gZWxbMF0uZmlsZXMubGVuZ3RoO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlcyA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBudW1iZXIgPSBlbC5kYXRhKCdudW1iZXInKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChudW1iZXIgPT09IHVuZGVmaW5lZCkgbnVtYmVyID0gb3B0LmZpbGVOdW1iZXI7XHJcblx0XHRcdFx0XHRcdFx0XHRudW1iZXIgPSBudW1iZXIucmVwbGFjZSgnJXMnLCBmaWxlcyk7XHJcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IG51bWJlcjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0bmFtZS50ZXh0KHZhbHVlLnJlcGxhY2UoLy4rW1xcXFxcXC9dLywgJycpKTtcclxuXHRcdFx0XHRcdFx0aWYgKHZhbHVlID09PSAnJykge1xyXG5cdFx0XHRcdFx0XHRcdG5hbWUudGV4dChwbGFjZWhvbGRlcik7XHJcblx0XHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmVDbGFzcygnY2hhbmdlZCcpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGZpbGUuYWRkQ2xhc3MoJ2NoYW5nZWQnKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGZpbGUuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2JsdXIuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2NsaWNrLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0fTsgLy8gZW5kIGZpbGVPdXRwdXQoKVxyXG5cclxuXHRcdFx0XHRmaWxlT3V0cHV0KCk7XHJcblxyXG5cdFx0XHRcdC8vINC+0LHQvdC+0LLQu9C10L3QuNC1INC/0YDQuCDQtNC40L3QsNC80LjRh9C10YHQutC+0Lwg0LjQt9C80LXQvdC10L3QuNC4XHJcblx0XHRcdFx0ZWwub24oJ3JlZnJlc2gnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGVsLm9mZignLnN0eWxlcicpLnBhcmVudCgpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRmaWxlT3V0cHV0KCk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBlbmQgZmlsZVxyXG5cclxuXHRcdFx0fSBlbHNlIGlmIChlbC5pcygnaW5wdXRbdHlwZT1cIm51bWJlclwiXScpKSB7XHJcblxyXG5cdFx0XHRcdHZhciBudW1iZXJPdXRwdXQgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdFx0XHR2YXIgbnVtYmVyID0gJCgnPGRpdiBjbGFzcz1cImpxLW51bWJlclwiPjxkaXYgY2xhc3M9XCJqcS1udW1iZXJfX3NwaW4gbWludXNcIj48L2Rpdj48ZGl2IGNsYXNzPVwianEtbnVtYmVyX19zcGluIHBsdXNcIj48L2Rpdj48L2Rpdj4nKTtcclxuXHRcdFx0XHRcdGVsLmFmdGVyKG51bWJlcikucHJlcGVuZFRvKG51bWJlcikud3JhcCgnPGRpdiBjbGFzcz1cImpxLW51bWJlcl9fZmllbGRcIj48L2Rpdj4nKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSBudW1iZXIuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIG1pbixcclxuXHRcdFx0XHRcdFx0XHRtYXgsXHJcblx0XHRcdFx0XHRcdFx0c3RlcCxcclxuXHRcdFx0XHRcdFx0XHR0aW1lb3V0ID0gbnVsbCxcclxuXHRcdFx0XHRcdFx0XHRpbnRlcnZhbCA9IG51bGw7XHJcblx0XHRcdFx0XHRpZiAoZWwuYXR0cignbWluJykgIT09IHVuZGVmaW5lZCkgbWluID0gZWwuYXR0cignbWluJyk7XHJcblx0XHRcdFx0XHRpZiAoZWwuYXR0cignbWF4JykgIT09IHVuZGVmaW5lZCkgbWF4ID0gZWwuYXR0cignbWF4Jyk7XHJcblx0XHRcdFx0XHRpZiAoZWwuYXR0cignc3RlcCcpICE9PSB1bmRlZmluZWQgJiYgJC5pc051bWVyaWMoZWwuYXR0cignc3RlcCcpKSlcclxuXHRcdFx0XHRcdFx0c3RlcCA9IE51bWJlcihlbC5hdHRyKCdzdGVwJykpO1xyXG5cdFx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0XHRzdGVwID0gTnVtYmVyKDEpO1xyXG5cclxuXHRcdFx0XHRcdHZhciBjaGFuZ2VWYWx1ZSA9IGZ1bmN0aW9uKHNwaW4pIHtcclxuXHRcdFx0XHRcdFx0dmFyIHZhbHVlID0gZWwudmFsKCksXHJcblx0XHRcdFx0XHRcdFx0XHRuZXdWYWx1ZTtcclxuXHRcdFx0XHRcdFx0aWYgKCEkLmlzTnVtZXJpYyh2YWx1ZSkpIHtcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IDA7XHJcblx0XHRcdFx0XHRcdFx0ZWwudmFsKCcwJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKHNwaW4uaXMoJy5taW51cycpKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3VmFsdWUgPSBwYXJzZUludCh2YWx1ZSwgMTApIC0gc3RlcDtcclxuXHRcdFx0XHRcdFx0XHRpZiAoc3RlcCA+IDApIG5ld1ZhbHVlID0gTWF0aC5jZWlsKG5ld1ZhbHVlIC8gc3RlcCkgKiBzdGVwO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNwaW4uaXMoJy5wbHVzJykpIHtcclxuXHRcdFx0XHRcdFx0XHRuZXdWYWx1ZSA9IHBhcnNlSW50KHZhbHVlLCAxMCkgKyBzdGVwO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChzdGVwID4gMCkgbmV3VmFsdWUgPSBNYXRoLmZsb29yKG5ld1ZhbHVlIC8gc3RlcCkgKiBzdGVwO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmICgkLmlzTnVtZXJpYyhtaW4pICYmICQuaXNOdW1lcmljKG1heCkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAobmV3VmFsdWUgPj0gbWluICYmIG5ld1ZhbHVlIDw9IG1heCkgZWwudmFsKG5ld1ZhbHVlKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICgkLmlzTnVtZXJpYyhtaW4pICYmICEkLmlzTnVtZXJpYyhtYXgpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG5ld1ZhbHVlID49IG1pbikgZWwudmFsKG5ld1ZhbHVlKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICghJC5pc051bWVyaWMobWluKSAmJiAkLmlzTnVtZXJpYyhtYXgpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG5ld1ZhbHVlIDw9IG1heCkgZWwudmFsKG5ld1ZhbHVlKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRlbC52YWwobmV3VmFsdWUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRcdGlmICghbnVtYmVyLmlzKCcuZGlzYWJsZWQnKSkge1xyXG5cdFx0XHRcdFx0XHRudW1iZXIub24oJ21vdXNlZG93bicsICdkaXYuanEtbnVtYmVyX19zcGluJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHNwaW4gPSAkKHRoaXMpO1xyXG5cdFx0XHRcdFx0XHRcdGNoYW5nZVZhbHVlKHNwaW4pO1xyXG5cdFx0XHRcdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0XHRpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7IGNoYW5nZVZhbHVlKHNwaW4pOyB9LCA0MCk7XHJcblx0XHRcdFx0XHRcdFx0fSwgMzUwKTtcclxuXHRcdFx0XHRcdFx0fSkub24oJ21vdXNldXAgbW91c2VvdXQnLCAnZGl2LmpxLW51bWJlcl9fc3BpbicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuXHRcdFx0XHRcdFx0XHRjbGVhckludGVydmFsKGludGVydmFsKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdGVsLm9uKCdmb2N1cy5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRudW1iZXIuYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0Lm9uKCdibHVyLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdG51bWJlci5yZW1vdmVDbGFzcygnZm9jdXNlZCcpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fTsgLy8gZW5kIG51bWJlck91dHB1dCgpXHJcblxyXG5cdFx0XHRcdG51bWJlck91dHB1dCgpO1xyXG5cclxuXHRcdFx0XHQvLyDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9GA0Lgg0LTQuNC90LDQvNC40YfQtdGB0LrQvtC8INC40LfQvNC10L3QtdC90LjQuFxyXG5cdFx0XHRcdGVsLm9uKCdyZWZyZXNoJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRlbC5vZmYoJy5zdHlsZXInKS5jbG9zZXN0KCcuanEtbnVtYmVyJykuYmVmb3JlKGVsKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdG51bWJlck91dHB1dCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gZW5kIG51bWJlclxyXG5cclxuXHRcdFx0Ly8gc2VsZWN0XHJcblx0XHRcdH0gZWxzZSBpZiAoZWwuaXMoJ3NlbGVjdCcpKSB7XHJcblxyXG5cdFx0XHRcdHZhciBzZWxlY3Rib3hPdXRwdXQgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdFx0XHQvLyDQt9Cw0L/RgNC10YnQsNC10Lwg0L/RgNC+0LrRgNGD0YLQutGDINGB0YLRgNCw0L3QuNGG0Ysg0L/RgNC4INC/0YDQvtC60YDRg9GC0LrQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24gcHJldmVudFNjcm9sbGluZyhzZWxlY3Rvcikge1xyXG5cdFx0XHRcdFx0XHRzZWxlY3Rvci5vZmYoJ21vdXNld2hlZWwgRE9NTW91c2VTY3JvbGwnKS5vbignbW91c2V3aGVlbCBET01Nb3VzZVNjcm9sbCcsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgc2Nyb2xsVG8gPSBudWxsO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChlLnR5cGUgPT0gJ21vdXNld2hlZWwnKSB7IHNjcm9sbFRvID0gKGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhICogLTEpOyB9XHJcblx0XHRcdFx0XHRcdFx0ZWxzZSBpZiAoZS50eXBlID09ICdET01Nb3VzZVNjcm9sbCcpIHsgc2Nyb2xsVG8gPSA0MCAqIGUub3JpZ2luYWxFdmVudC5kZXRhaWw7IH1cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2Nyb2xsVG8pIHtcclxuXHRcdFx0XHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0XHQkKHRoaXMpLnNjcm9sbFRvcChzY3JvbGxUbyArICQodGhpcykuc2Nyb2xsVG9wKCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dmFyIG9wdGlvbiA9ICQoJ29wdGlvbicsIGVsKTtcclxuXHRcdFx0XHRcdHZhciBsaXN0ID0gJyc7XHJcblx0XHRcdFx0XHQvLyDRhNC+0YDQvNC40YDRg9C10Lwg0YHQv9C40YHQvtC6INGB0LXQu9C10LrRgtCwXHJcblx0XHRcdFx0XHRmdW5jdGlvbiBtYWtlTGlzdCgpIHtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcHRpb24ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgb3AgPSBvcHRpb24uZXEoaSk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGxpID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGxpQ2xhc3MgPSAnJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0bGlDbGFzc2VzID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlkID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGFMaXN0ID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wdGlvbkNsYXNzID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wdGdyb3VwQ2xhc3MgPSAnJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUpxZnNDbGFzcyA9ICcnO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBkaXNhYmxlZCA9ICdkaXNhYmxlZCc7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHNlbERpcyA9ICdzZWxlY3RlZCBzZWwgZGlzYWJsZWQnO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvcC5wcm9wKCdzZWxlY3RlZCcpKSBsaUNsYXNzID0gJ3NlbGVjdGVkIHNlbCc7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLmlzKCc6ZGlzYWJsZWQnKSkgbGlDbGFzcyA9IGRpc2FibGVkO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvcC5pcygnOnNlbGVjdGVkOmRpc2FibGVkJykpIGxpQ2xhc3MgPSBzZWxEaXM7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLmF0dHIoJ2lkJykgIT09IHVuZGVmaW5lZCAmJiBvcC5hdHRyKCdpZCcpICE9PSAnJykgaWQgPSAnIGlkPVwiJyArIG9wLmF0dHIoJ2lkJykgKyBvcHQuaWRTdWZmaXggKyAnXCInO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvcC5hdHRyKCd0aXRsZScpICE9PSB1bmRlZmluZWQgJiYgb3B0aW9uLmF0dHIoJ3RpdGxlJykgIT09ICcnKSB0aXRsZSA9ICcgdGl0bGU9XCInICsgb3AuYXR0cigndGl0bGUnKSArICdcIic7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLmF0dHIoJ2NsYXNzJykgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uQ2xhc3MgPSAnICcgKyBvcC5hdHRyKCdjbGFzcycpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YUpxZnNDbGFzcyA9ICcgZGF0YS1qcWZzLWNsYXNzPVwiJyArIG9wLmF0dHIoJ2NsYXNzJykgKyAnXCInO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIGRhdGEgPSBvcC5kYXRhKCk7XHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgayBpbiBkYXRhKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZGF0YVtrXSAhPT0gJycpIGRhdGFMaXN0ICs9ICcgZGF0YS0nICsgayArICc9XCInICsgZGF0YVtrXSArICdcIic7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIChsaUNsYXNzICsgb3B0aW9uQ2xhc3MpICE9PSAnJyApICAgbGlDbGFzc2VzID0gJyBjbGFzcz1cIicgKyBsaUNsYXNzICsgb3B0aW9uQ2xhc3MgKyAnXCInO1xyXG5cdFx0XHRcdFx0XHRcdGxpID0gJzxsaScgKyBkYXRhSnFmc0NsYXNzICsgZGF0YUxpc3QgKyBsaUNsYXNzZXMgKyB0aXRsZSArIGlkICsgJz4nKyBvcC5odG1sKCkgKyc8L2xpPic7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC10YHQu9C4INC10YHRgtGMIG9wdGdyb3VwXHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLnBhcmVudCgpLmlzKCdvcHRncm91cCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAob3AucGFyZW50KCkuYXR0cignY2xhc3MnKSAhPT0gdW5kZWZpbmVkKSBvcHRncm91cENsYXNzID0gJyAnICsgb3AucGFyZW50KCkuYXR0cignY2xhc3MnKTtcclxuXHRcdFx0XHRcdFx0XHRcdGxpID0gJzxsaScgKyBkYXRhSnFmc0NsYXNzICsgZGF0YUxpc3QgKyAnIGNsYXNzPVwiJyArIGxpQ2xhc3MgKyBvcHRpb25DbGFzcyArICcgb3B0aW9uJyArIG9wdGdyb3VwQ2xhc3MgKyAnXCInICsgdGl0bGUgKyBpZCArICc+Jysgb3AuaHRtbCgpICsnPC9saT4nO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wLmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRsaSA9ICc8bGkgY2xhc3M9XCJvcHRncm91cCcgKyBvcHRncm91cENsYXNzICsgJ1wiPicgKyBvcC5wYXJlbnQoKS5hdHRyKCdsYWJlbCcpICsgJzwvbGk+JyArIGxpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0bGlzdCArPSBsaTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSAvLyBlbmQgbWFrZUxpc3QoKVxyXG5cclxuXHRcdFx0XHRcdC8vINC+0LTQuNC90L7Rh9C90YvQuSDRgdC10LvQtdC60YJcclxuXHRcdFx0XHRcdGZ1bmN0aW9uIGRvU2VsZWN0KCkge1xyXG5cdFx0XHRcdFx0XHR2YXIgYXR0ID0gbmV3IEF0dHJpYnV0ZXMoKTtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBzZWFyY2hIVE1MID0gJyc7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RQbGFjZWhvbGRlciA9IGVsLmRhdGEoJ3BsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RTZWFyY2ggPSBlbC5kYXRhKCdzZWFyY2gnKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdFNlYXJjaExpbWl0ID0gZWwuZGF0YSgnc2VhcmNoLWxpbWl0Jyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RTZWFyY2hOb3RGb3VuZCA9IGVsLmRhdGEoJ3NlYXJjaC1ub3QtZm91bmQnKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdFNlYXJjaFBsYWNlaG9sZGVyID0gZWwuZGF0YSgnc2VhcmNoLXBsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdHZhciBzaW5nbGVTZWxlY3R6SW5kZXggPSBlbC5kYXRhKCd6LWluZGV4Jyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID0gZWwuZGF0YSgnc21hcnQtcG9zaXRpb25pbmcnKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RQbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSBzZWxlY3RQbGFjZWhvbGRlciA9IG9wdC5zZWxlY3RQbGFjZWhvbGRlcjtcclxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdFNlYXJjaCA9PT0gdW5kZWZpbmVkIHx8IHNlbGVjdFNlYXJjaCA9PT0gJycpIHNlbGVjdFNlYXJjaCA9IG9wdC5zZWxlY3RTZWFyY2g7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTZWFyY2hMaW1pdCA9PT0gdW5kZWZpbmVkIHx8IHNlbGVjdFNlYXJjaExpbWl0ID09PSAnJykgc2VsZWN0U2VhcmNoTGltaXQgPSBvcHQuc2VsZWN0U2VhcmNoTGltaXQ7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTZWFyY2hOb3RGb3VuZCA9PT0gdW5kZWZpbmVkIHx8IHNlbGVjdFNlYXJjaE5vdEZvdW5kID09PSAnJykgc2VsZWN0U2VhcmNoTm90Rm91bmQgPSBvcHQuc2VsZWN0U2VhcmNoTm90Rm91bmQ7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTZWFyY2hQbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSBzZWxlY3RTZWFyY2hQbGFjZWhvbGRlciA9IG9wdC5zZWxlY3RTZWFyY2hQbGFjZWhvbGRlcjtcclxuXHRcdFx0XHRcdFx0aWYgKHNpbmdsZVNlbGVjdHpJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHNpbmdsZVNlbGVjdHpJbmRleCA9PT0gJycpIHNpbmdsZVNlbGVjdHpJbmRleCA9IG9wdC5zaW5nbGVTZWxlY3R6SW5kZXg7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSB1bmRlZmluZWQgfHwgc2VsZWN0U21hcnRQb3NpdGlvbmluZyA9PT0gJycpIHNlbGVjdFNtYXJ0UG9zaXRpb25pbmcgPSBvcHQuc2VsZWN0U21hcnRQb3NpdGlvbmluZztcclxuXHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3Rib3ggPVxyXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYnICsgYXR0LmlkICsgJyBjbGFzcz1cImpxLXNlbGVjdGJveCBqcXNlbGVjdCcgKyBhdHQuY2xhc3NlcyArICdcIiBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1ibG9jazsgcG9zaXRpb246IHJlbGF0aXZlOyB6LWluZGV4OicgKyBzaW5nbGVTZWxlY3R6SW5kZXggKyAnXCI+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X19zZWxlY3RcIicgKyBhdHQudGl0bGUgKyAnIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlXCI+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3NlbGVjdC10ZXh0XCI+PC9kaXY+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3RyaWdnZXJcIj48ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X190cmlnZ2VyLWFycm93XCI+PC9kaXY+PC9kaXY+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdCc8L2Rpdj4nICtcclxuXHRcdFx0XHRcdFx0XHRcdCc8L2Rpdj4nKTtcclxuXHJcblx0XHRcdFx0XHRcdGVsLmNzcyh7bWFyZ2luOiAwLCBwYWRkaW5nOiAwfSkuYWZ0ZXIoc2VsZWN0Ym94KS5wcmVwZW5kVG8oc2VsZWN0Ym94KTtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBkaXZTZWxlY3QgPSAkKCdkaXYuanEtc2VsZWN0Ym94X19zZWxlY3QnLCBzZWxlY3Rib3gpO1xyXG5cdFx0XHRcdFx0XHR2YXIgZGl2VGV4dCA9ICQoJ2Rpdi5qcS1zZWxlY3Rib3hfX3NlbGVjdC10ZXh0Jywgc2VsZWN0Ym94KTtcclxuXHRcdFx0XHRcdFx0dmFyIG9wdGlvblNlbGVjdGVkID0gb3B0aW9uLmZpbHRlcignOnNlbGVjdGVkJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRtYWtlTGlzdCgpO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdFNlYXJjaCkgc2VhcmNoSFRNTCA9XHJcblx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3NlYXJjaFwiPjxpbnB1dCB0eXBlPVwic2VhcmNoXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgcGxhY2Vob2xkZXI9XCInICsgc2VsZWN0U2VhcmNoUGxhY2Vob2xkZXIgKyAnXCI+PC9kaXY+JyArXHJcblx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX25vdC1mb3VuZFwiPicgKyBzZWxlY3RTZWFyY2hOb3RGb3VuZCArICc8L2Rpdj4nO1xyXG5cdFx0XHRcdFx0XHR2YXIgZHJvcGRvd24gPVxyXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX2Ryb3Bkb3duXCIgc3R5bGU9XCJwb3NpdGlvbjogYWJzb2x1dGVcIj4nICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2VhcmNoSFRNTCArXHJcblx0XHRcdFx0XHRcdFx0XHRcdCc8dWwgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmU7IGxpc3Qtc3R5bGU6IG5vbmU7IG92ZXJmbG93OiBhdXRvOyBvdmVyZmxvdy14OiBoaWRkZW5cIj4nICsgbGlzdCArICc8L3VsPicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0JzwvZGl2PicpO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3Rib3guYXBwZW5kKGRyb3Bkb3duKTtcclxuXHRcdFx0XHRcdFx0dmFyIHVsID0gJCgndWwnLCBkcm9wZG93bik7XHJcblx0XHRcdFx0XHRcdHZhciBsaSA9ICQoJ2xpJywgZHJvcGRvd24pO1xyXG5cdFx0XHRcdFx0XHR2YXIgc2VhcmNoID0gJCgnaW5wdXQnLCBkcm9wZG93bik7XHJcblx0XHRcdFx0XHRcdHZhciBub3RGb3VuZCA9ICQoJ2Rpdi5qcS1zZWxlY3Rib3hfX25vdC1mb3VuZCcsIGRyb3Bkb3duKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaS5sZW5ndGggPCBzZWxlY3RTZWFyY2hMaW1pdCkgc2VhcmNoLnBhcmVudCgpLmhpZGUoKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC/0L7QutCw0LfRi9Cy0LDQtdC8INC+0L/RhtC40Y4g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y5cclxuXHRcdFx0XHRcdFx0Ly8g0LXRgdC70LggMS3RjyDQvtC/0YbQuNGPINC/0YPRgdGC0LDRjyDQuCDQstGL0LHRgNCw0L3QsCDQv9C+INGD0LzQvtC70YfQsNC90LjRjiwg0YLQviDQv9C+0LrQsNC30YvQstCw0LXQvCDQv9C70LXQudGB0YXQvtC70LTQtdGAXHJcblx0XHRcdFx0XHRcdGlmIChlbC52YWwoKSA9PT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRkaXZUZXh0LnRleHQoc2VsZWN0UGxhY2Vob2xkZXIpLmFkZENsYXNzKCdwbGFjZWhvbGRlcicpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChvcHRpb25TZWxlY3RlZC50ZXh0KCkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQvtC/0YDQtdC00LXQu9GP0LXQvCDRgdCw0LzRi9C5INGI0LjRgNC+0LrQuNC5INC/0YPQvdC60YIg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0dmFyIGxpV2lkdGhJbm5lciA9IDAsXHJcblx0XHRcdFx0XHRcdFx0XHRsaVdpZHRoID0gMDtcclxuXHRcdFx0XHRcdFx0bGkuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbCA9ICQodGhpcyk7XHJcblx0XHRcdFx0XHRcdFx0bC5jc3MoeydkaXNwbGF5JzogJ2lubGluZS1ibG9jayd9KTtcclxuXHRcdFx0XHRcdFx0XHRpZiAobC5pbm5lcldpZHRoKCkgPiBsaVdpZHRoSW5uZXIpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGxpV2lkdGhJbm5lciA9IGwuaW5uZXJXaWR0aCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0bGlXaWR0aCA9IGwud2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0bC5jc3MoeydkaXNwbGF5JzogJyd9KTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQv9C+0LTRgdGC0YDQsNC40LLQsNC10Lwg0YjQuNGA0LjQvdGDINGB0LLQtdGA0L3Rg9GC0L7Qs9C+INGB0LXQu9C10LrRgtCwINCyINC30LDQstC40YHQuNC80L7RgdGC0LhcclxuXHRcdFx0XHRcdFx0Ly8g0L7RgiDRiNC40YDQuNC90Ysg0L/Qu9C10LnRgdGF0L7Qu9C00LXRgNCwINC40LvQuCDRgdCw0LzQvtCz0L4g0YjQuNGA0L7QutC+0LPQviDQv9GD0L3QutGC0LBcclxuXHRcdFx0XHRcdFx0aWYgKGRpdlRleHQuaXMoJy5wbGFjZWhvbGRlcicpICYmIChkaXZUZXh0LndpZHRoKCkgPiBsaVdpZHRoSW5uZXIpKSB7XHJcblx0XHRcdFx0XHRcdFx0ZGl2VGV4dC53aWR0aChkaXZUZXh0LndpZHRoKCkpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBzZWxDbG9uZSA9IHNlbGVjdGJveC5jbG9uZSgpLmFwcGVuZFRvKCdib2R5Jykud2lkdGgoJ2F1dG8nKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgc2VsQ2xvbmVXaWR0aCA9IHNlbENsb25lLm91dGVyV2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0XHRzZWxDbG9uZS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VsQ2xvbmVXaWR0aCA9PSBzZWxlY3Rib3gub3V0ZXJXaWR0aCgpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRkaXZUZXh0LndpZHRoKGxpV2lkdGgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/QvtC00YHRgtGA0LDQuNCy0LDQtdC8INGI0LjRgNC40L3RgyDQstGL0L/QsNC00LDRjtGJ0LXQs9C+INGB0L/QuNGB0LrQsCDQsiDQt9Cw0LLQuNGB0LjQvNC+0YHRgtC4INC+0YIg0YHQsNC80L7Qs9C+INGI0LjRgNC+0LrQvtCz0L4g0L/Rg9C90LrRgtCwXHJcblx0XHRcdFx0XHRcdGlmIChsaVdpZHRoSW5uZXIgPiBzZWxlY3Rib3gud2lkdGgoKSkgZHJvcGRvd24ud2lkdGgobGlXaWR0aElubmVyKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC/0YDRj9GH0LXQvCAxLdGOINC/0YPRgdGC0YPRjiDQvtC/0YbQuNGOLCDQtdGB0LvQuCDQvtC90LAg0LXRgdGC0Ywg0Lgg0LXRgdC70Lgg0LDRgtGA0LjQsdGD0YIgZGF0YS1wbGFjZWhvbGRlciDQvdC1INC/0YPRgdGC0L7QuVxyXG5cdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDQstGB0LUg0LbQtSDQvdGD0LbQvdC+LCDRh9GC0L7QsdGLINC/0LXRgNCy0LDRjyDQv9GD0YHRgtCw0Y8g0L7Qv9GG0LjRjyDQvtGC0L7QsdGA0LDQttCw0LvQsNGB0YwsINGC0L4g0YPQutCw0LfRi9Cy0LDQtdC8INGDINGB0LXQu9C10LrRgtCwOiBkYXRhLXBsYWNlaG9sZGVyPVwiXCJcclxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbi5maXJzdCgpLnRleHQoKSA9PT0gJycgJiYgZWwuZGF0YSgncGxhY2Vob2xkZXInKSAhPT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRsaS5maXJzdCgpLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNGP0YfQtdC8INC+0YDQuNCz0LjQvdCw0LvRjNC90YvQuSDRgdC10LvQtdC60YJcclxuXHRcdFx0XHRcdFx0ZWwuY3NzKHtcclxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuXHRcdFx0XHRcdFx0XHRsZWZ0OiAwLFxyXG5cdFx0XHRcdFx0XHRcdHRvcDogMCxcclxuXHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxyXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRcdFx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgc2VsZWN0SGVpZ2h0ID0gc2VsZWN0Ym94Lm91dGVySGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWFyY2hIZWlnaHQgPSBzZWFyY2gub3V0ZXJIZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0dmFyIGlzTWF4SGVpZ2h0ID0gdWwuY3NzKCdtYXgtaGVpZ2h0Jyk7XHJcblx0XHRcdFx0XHRcdHZhciBsaVNlbGVjdGVkID0gbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0aWYgKGxpU2VsZWN0ZWQubGVuZ3RoIDwgMSkgbGkuZmlyc3QoKS5hZGRDbGFzcygnc2VsZWN0ZWQgc2VsJyk7XHJcblx0XHRcdFx0XHRcdGlmIChsaS5kYXRhKCdsaS1oZWlnaHQnKSA9PT0gdW5kZWZpbmVkKSBsaS5kYXRhKCdsaS1oZWlnaHQnLCBsaS5vdXRlckhlaWdodCgpKTtcclxuXHRcdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gZHJvcGRvd24uY3NzKCd0b3AnKTtcclxuXHRcdFx0XHRcdFx0aWYgKGRyb3Bkb3duLmNzcygnbGVmdCcpID09ICdhdXRvJykgZHJvcGRvd24uY3NzKHtsZWZ0OiAwfSk7XHJcblx0XHRcdFx0XHRcdGlmIChkcm9wZG93bi5jc3MoJ3RvcCcpID09ICdhdXRvJykgZHJvcGRvd24uY3NzKHt0b3A6IHNlbGVjdEhlaWdodH0pO1xyXG5cdFx0XHRcdFx0XHRkcm9wZG93bi5oaWRlKCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDQstGL0LHRgNCw0L0g0L3QtSDQtNC10YTQvtC70YLQvdGL0Lkg0L/Rg9C90LrRglxyXG5cdFx0XHRcdFx0XHRpZiAobGlTZWxlY3RlZC5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSwg0L/QvtC60LDQt9GL0LLQsNGO0YnQuNC5INC40LfQvNC10L3QtdC90LjQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb24uZmlyc3QoKS50ZXh0KCkgIT0gb3B0aW9uU2VsZWN0ZWQudGV4dCgpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rib3guYWRkQ2xhc3MoJ2NoYW5nZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQtNCw0LXQvCDRgdC10LvQtdC60YLRgyDQutC70LDRgdGBINCy0YvQsdGA0LDQvdC90L7Qs9C+INC/0YPQvdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5kYXRhKCdqcWZzLWNsYXNzJywgbGlTZWxlY3RlZC5kYXRhKCdqcWZzLWNsYXNzJykpO1xyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcyhsaVNlbGVjdGVkLmRhdGEoJ2pxZnMtY2xhc3MnKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vINC10YHQu9C4INGB0LXQu9C10LrRgiDQvdC10LDQutGC0LjQstC90YvQuVxyXG5cdFx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNC4INC60LvQuNC60LUg0L3QsCDQv9GB0LXQstC00L7RgdC10LvQtdC60YLQtVxyXG5cdFx0XHRcdFx0XHRkaXZTZWxlY3QuY2xpY2soZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0LfQsNC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmICgkKCdkaXYuanEtc2VsZWN0Ym94JykuZmlsdGVyKCcub3BlbmVkJykubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRvcHQub25TZWxlY3RDbG9zZWQuY2FsbCgkKCdkaXYuanEtc2VsZWN0Ym94JykuZmlsdGVyKCcub3BlbmVkJykpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0ZWwuZm9jdXMoKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8g0LXRgdC70LggaU9TLCDRgtC+INC90LUg0L/QvtC60LDQt9GL0LLQsNC10Lwg0LLRi9C/0LDQtNCw0Y7RidC40Lkg0YHQv9C40YHQvtC6LFxyXG5cdFx0XHRcdFx0XHRcdC8vINGCLtC6LiDQvtGC0L7QsdGA0LDQttCw0LXRgtGB0Y8g0L3QsNGC0LjQstC90YvQuSDQuCDQvdC10LjQt9Cy0LXRgdGC0L3Qviwg0LrQsNC6INC10LPQviDRgdC/0YDRj9GC0LDRgtGMXHJcblx0XHRcdFx0XHRcdFx0aWYgKGlPUykgcmV0dXJuO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDRg9C80L3QvtC1INC/0L7Qt9C40YbQuNC+0L3QuNGA0L7QstCw0L3QuNC1XHJcblx0XHRcdFx0XHRcdFx0dmFyIHdpbiA9ICQod2luZG93KTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbGlIZWlnaHQgPSBsaS5kYXRhKCdsaS1oZWlnaHQnKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgdG9wT2Zmc2V0ID0gc2VsZWN0Ym94Lm9mZnNldCgpLnRvcDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgYm90dG9tT2Zmc2V0ID0gd2luLmhlaWdodCgpIC0gc2VsZWN0SGVpZ2h0IC0gKHRvcE9mZnNldCAtIHdpbi5zY3JvbGxUb3AoKSk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZpc2libGUgPSBlbC5kYXRhKCd2aXNpYmxlLW9wdGlvbnMnKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAodmlzaWJsZSA9PT0gdW5kZWZpbmVkIHx8IHZpc2libGUgPT09ICcnKSB2aXNpYmxlID0gb3B0LnNlbGVjdFZpc2libGVPcHRpb25zO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBtaW5IZWlnaHQgPSBsaUhlaWdodCAqIDU7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG5ld0hlaWdodCA9IGxpSGVpZ2h0ICogdmlzaWJsZTtcclxuXHRcdFx0XHRcdFx0XHRpZiAodmlzaWJsZSA+IDAgJiYgdmlzaWJsZSA8IDYpIG1pbkhlaWdodCA9IG5ld0hlaWdodDtcclxuXHRcdFx0XHRcdFx0XHRpZiAodmlzaWJsZSA9PT0gMCkgbmV3SGVpZ2h0ID0gJ2F1dG8nO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgZHJvcERvd24gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duLmhlaWdodCgnYXV0bycpLmNzcyh7Ym90dG9tOiAnYXV0bycsIHRvcDogcG9zaXRpb259KTtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXhIZWlnaHRCb3R0b20gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgTWF0aC5mbG9vcigoYm90dG9tT2Zmc2V0IC0gMjAgLSBzZWFyY2hIZWlnaHQpIC8gbGlIZWlnaHQpICogbGlIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodEJvdHRvbSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgbmV3SGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChpc01heEhlaWdodCAhPSAnbm9uZScpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgaXNNYXhIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGJvdHRvbU9mZnNldCA8IChkcm9wZG93bi5vdXRlckhlaWdodCgpICsgMjApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodEJvdHRvbSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciBkcm9wVXAgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duLmhlaWdodCgnYXV0bycpLmNzcyh7dG9wOiAnYXV0bycsIGJvdHRvbTogcG9zaXRpb259KTtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXhIZWlnaHRUb3AgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgTWF0aC5mbG9vcigodG9wT2Zmc2V0IC0gd2luLnNjcm9sbFRvcCgpIC0gMjAgLSBzZWFyY2hIZWlnaHQpIC8gbGlIZWlnaHQpICogbGlIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodFRvcCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgbmV3SGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChpc01heEhlaWdodCAhPSAnbm9uZScpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgaXNNYXhIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCh0b3BPZmZzZXQgLSB3aW4uc2Nyb2xsVG9wKCkgLSAyMCkgPCAoZHJvcGRvd24ub3V0ZXJIZWlnaHQoKSArIDIwKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXhIZWlnaHRUb3AoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZWN0U21hcnRQb3NpdGlvbmluZyA9PT0gdHJ1ZSB8fCBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDRgNCw0YHQutGA0YvRgtC40LUg0LLQvdC40LdcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChib3R0b21PZmZzZXQgPiAobWluSGVpZ2h0ICsgc2VhcmNoSGVpZ2h0ICsgMjApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGRyb3BEb3duKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZHJvcHVwJykuYWRkQ2xhc3MoJ2Ryb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDRgNCw0YHQutGA0YvRgtC40LUg0LLQstC10YDRhVxyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZHJvcFVwKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZHJvcGRvd24nKS5hZGRDbGFzcygnZHJvcHVwJyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSBmYWxzZSB8fCBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDRgNCw0YHQutGA0YvRgtC40LUg0LLQvdC40LdcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChib3R0b21PZmZzZXQgPiAobWluSGVpZ2h0ICsgc2VhcmNoSGVpZ2h0ICsgMjApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGRyb3BEb3duKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZHJvcHVwJykuYWRkQ2xhc3MoJ2Ryb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0Log0LLRi9GF0L7QtNC40YIg0LfQsCDQv9GA0LDQstGL0Lkg0LrRgNCw0Lkg0L7QutC90LAg0LHRgNCw0YPQt9C10YDQsCxcclxuXHRcdFx0XHRcdFx0XHQvLyDRgtC+INC80LXQvdGP0LXQvCDQv9C+0LfQuNGG0LjQvtC90LjRgNC+0LLQsNC90LjQtSDRgSDQu9C10LLQvtCz0L4g0L3QsCDQv9GA0LDQstC+0LVcclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZWN0Ym94Lm9mZnNldCgpLmxlZnQgKyBkcm9wZG93bi5vdXRlcldpZHRoKCkgPiB3aW4ud2lkdGgoKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uY3NzKHtsZWZ0OiAnYXV0bycsIHJpZ2h0OiAwfSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdC8vINC60L7QvdC10YYg0YPQvNC90L7Qs9C+INC/0L7Qt9C40YbQuNC+0L3QuNGA0L7QstCw0L3QuNGPXHJcblxyXG5cdFx0XHRcdFx0XHRcdCQoJ2Rpdi5qcXNlbGVjdCcpLmNzcyh7ekluZGV4OiAoc2luZ2xlU2VsZWN0ekluZGV4IC0gMSl9KS5yZW1vdmVDbGFzcygnb3BlbmVkJyk7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmNzcyh7ekluZGV4OiBzaW5nbGVTZWxlY3R6SW5kZXh9KTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZHJvcGRvd24uaXMoJzpoaWRkZW4nKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnZGl2LmpxLXNlbGVjdGJveF9fZHJvcGRvd246dmlzaWJsZScpLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duLnNob3coKTtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcygnb3BlbmVkIGZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdFx0b3B0Lm9uU2VsZWN0T3BlbmVkLmNhbGwoc2VsZWN0Ym94KTtcclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LnJlbW92ZUNsYXNzKCdvcGVuZWQgZHJvcHVwIGRyb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDQutC+0LvQsdC10Log0L/RgNC4INC30LDQutGA0YvRgtC40Lgg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0XHRcdGlmICgkKCdkaXYuanEtc2VsZWN0Ym94JykuZmlsdGVyKCcub3BlbmVkJykubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQv9C+0LjRgdC60L7QstC+0LUg0L/QvtC70LVcclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VhcmNoLnZhbCgnJykua2V5dXAoKTtcclxuXHRcdFx0XHRcdFx0XHRcdG5vdEZvdW5kLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdHNlYXJjaC5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIHF1ZXJ5ID0gJCh0aGlzKS52YWwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0bGkuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoISQodGhpcykuaHRtbCgpLm1hdGNoKG5ldyBSZWdFeHAoJy4qPycgKyBxdWVyeSArICcuKj8nLCAnaScpKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQodGhpcykuc2hvdygpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vINC/0YDRj9GH0LXQvCAxLdGOINC/0YPRgdGC0YPRjiDQvtC/0YbQuNGOXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb24uZmlyc3QoKS50ZXh0KCkgPT09ICcnICYmIGVsLmRhdGEoJ3BsYWNlaG9sZGVyJykgIT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGkuZmlyc3QoKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGxpLmZpbHRlcignOnZpc2libGUnKS5sZW5ndGggPCAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bm90Rm91bmQuc2hvdygpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vdEZvdW5kLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQv9GA0L7QutGA0YPRh9C40LLQsNC10Lwg0LTQviDQstGL0LHRgNCw0L3QvdC+0LPQviDQv9GD0L3QutGC0LAg0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YHQv9C40YHQutCwXHJcblx0XHRcdFx0XHRcdFx0aWYgKGxpLmZpbHRlcignLnNlbGVjdGVkJykubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZWwudmFsKCkgPT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCgwKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vINC10YHQu9C4INC90LXRh9C10YLQvdC+0LUg0LrQvtC70LjRh9C10YHRgtCy0L4g0LLQuNC00LjQvNGL0YUg0L/Rg9C90LrRgtC+0LIsXHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vINGC0L4g0LLRi9GB0L7RgtGDINC/0YPQvdC60YLQsCDQtNC10LvQuNC8INC/0L7Qv9C+0LvQsNC8INC00LvRjyDQv9C+0YHQu9C10LTRg9GO0YnQtdCz0L4g0YDQsNGB0YfQtdGC0LBcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCAodWwuaW5uZXJIZWlnaHQoKSAvIGxpSGVpZ2h0KSAlIDIgIT09IDAgKSBsaUhlaWdodCA9IGxpSGVpZ2h0IC8gMjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuc2Nyb2xsVG9wKHVsLnNjcm9sbFRvcCgpICsgbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS5wb3NpdGlvbigpLnRvcCAtIHVsLmlubmVySGVpZ2h0KCkgLyAyICsgbGlIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0cHJldmVudFNjcm9sbGluZyh1bCk7XHJcblxyXG5cdFx0XHRcdFx0XHR9KTsgLy8gZW5kIGRpdlNlbGVjdC5jbGljaygpXHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQv9GA0Lgg0L3QsNCy0LXQtNC10L3QuNC4INC60YPRgNGB0L7RgNCwINC90LAg0L/Rg9C90LrRgiDRgdC/0LjRgdC60LBcclxuXHRcdFx0XHRcdFx0bGkuaG92ZXIoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0JCh0aGlzKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdGVkVGV4dCA9IGxpLmZpbHRlcignLnNlbGVjdGVkJykudGV4dCgpO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNC4INC60LvQuNC60LUg0L3QsCDQv9GD0L3QutGCINGB0L/QuNGB0LrQsFxyXG5cdFx0XHRcdFx0XHRsaS5maWx0ZXIoJzpub3QoLmRpc2FibGVkKTpub3QoLm9wdGdyb3VwKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGVsLmZvY3VzKCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHQgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBsaVRleHQgPSB0LnRleHQoKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXQuaXMoJy5zZWxlY3RlZCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgaW5kZXggPSB0LmluZGV4KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpbmRleCAtPSB0LnByZXZBbGwoJy5vcHRncm91cCcpLmxlbmd0aDtcclxuXHRcdFx0XHRcdFx0XHRcdHQuYWRkQ2xhc3MoJ3NlbGVjdGVkIHNlbCcpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkIHNlbCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uLnByb3AoJ3NlbGVjdGVkJywgZmFsc2UpLmVxKGluZGV4KS5wcm9wKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRUZXh0ID0gbGlUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGl2VGV4dC50ZXh0KGxpVGV4dCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQtNCw0LXQvCDRgdC10LvQtdC60YLRgyDQutC70LDRgdGBINCy0YvQsdGA0LDQvdC90L7Qs9C+INC/0YPQvdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdGJveC5kYXRhKCdqcWZzLWNsYXNzJykpIHNlbGVjdGJveC5yZW1vdmVDbGFzcyhzZWxlY3Rib3guZGF0YSgnanFmcy1jbGFzcycpKTtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5kYXRhKCdqcWZzLWNsYXNzJywgdC5kYXRhKCdqcWZzLWNsYXNzJykpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKHQuZGF0YSgnanFmcy1jbGFzcycpKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRlbC5jaGFuZ2UoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnb3BlbmVkIGRyb3B1cCBkcm9wZG93bicpO1xyXG5cdFx0XHRcdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0LfQsNC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0ZHJvcGRvd24ubW91c2VvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0JCgnbGkuc2VsJywgZHJvcGRvd24pLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC40LfQvNC10L3QtdC90LjQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRlbC5vbignY2hhbmdlLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChvcHRpb24uZmlsdGVyKCc6c2VsZWN0ZWQnKS50ZXh0KCkpLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpO1xyXG5cdFx0XHRcdFx0XHRcdGxpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCBzZWwnKS5ub3QoJy5vcHRncm91cCcpLmVxKGVsWzBdLnNlbGVjdGVkSW5kZXgpLmFkZENsYXNzKCdzZWxlY3RlZCBzZWwnKTtcclxuXHRcdFx0XHRcdFx0XHQvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSwg0L/QvtC60LDQt9GL0LLQsNGO0YnQuNC5INC40LfQvNC10L3QtdC90LjQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb24uZmlyc3QoKS50ZXh0KCkgIT0gbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS50ZXh0KCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcygnY2hhbmdlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rib3gucmVtb3ZlQ2xhc3MoJ2NoYW5nZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0JCgnZGl2Lmpxc2VsZWN0Jykubm90KCcuZm9jdXNlZCcpLnJlbW92ZUNsYXNzKCdvcGVuZWQgZHJvcHVwIGRyb3Bkb3duJykuZmluZCgnZGl2LmpxLXNlbGVjdGJveF9fZHJvcGRvd24nKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5vbignYmx1ci5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRzZWxlY3Rib3gucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0Ly8g0LjQt9C80LXQvdC10L3QuNC1INGB0LXQu9C10LrRgtCwINGBINC60LvQsNCy0LjQsNGC0YPRgNGLXHJcblx0XHRcdFx0XHRcdC5vbigna2V5ZG93bi5zdHlsZXIga2V5dXAuc3R5bGVyJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBsaUhlaWdodCA9IGxpLmRhdGEoJ2xpLWhlaWdodCcpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChlbC52YWwoKSA9PT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChzZWxlY3RQbGFjZWhvbGRlcikuYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChvcHRpb24uZmlsdGVyKCc6c2VsZWN0ZWQnKS50ZXh0KCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRsaS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQgc2VsJykubm90KCcub3B0Z3JvdXAnKS5lcShlbFswXS5zZWxlY3RlZEluZGV4KS5hZGRDbGFzcygnc2VsZWN0ZWQgc2VsJyk7XHJcblx0XHRcdFx0XHRcdFx0Ly8g0LLQstC10YDRhSwg0LLQu9C10LLQviwgUGFnZSBVcCwgSG9tZVxyXG5cdFx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDM4IHx8IGUud2hpY2ggPT0gMzcgfHwgZS53aGljaCA9PSAzMyB8fCBlLndoaWNoID09IDM2KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZWwudmFsKCkgPT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCgwKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCh1bC5zY3JvbGxUb3AoKSArIGxpLmZpbHRlcignLnNlbGVjdGVkJykucG9zaXRpb24oKS50b3ApO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQvLyDQstC90LjQtywg0LLQv9GA0LDQstC+LCBQYWdlIERvd24sIEVuZFxyXG5cdFx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDQwIHx8IGUud2hpY2ggPT0gMzkgfHwgZS53aGljaCA9PSAzNCB8fCBlLndoaWNoID09IDM1KSB7XHJcblx0XHRcdFx0XHRcdFx0XHR1bC5zY3JvbGxUb3AodWwuc2Nyb2xsVG9wKCkgKyBsaS5maWx0ZXIoJy5zZWxlY3RlZCcpLnBvc2l0aW9uKCkudG9wIC0gdWwuaW5uZXJIZWlnaHQoKSArIGxpSGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ly8g0LfQsNC60YDRi9Cy0LDQtdC8INCy0YvQv9Cw0LTQsNGO0YnQuNC5INGB0L/QuNGB0L7QuiDQv9GA0Lgg0L3QsNC20LDRgtC40LggRW50ZXJcclxuXHRcdFx0XHRcdFx0XHRpZiAoZS53aGljaCA9PSAxMykge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LnJlbW92ZUNsYXNzKCdvcGVuZWQgZHJvcHVwIGRyb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDQutC+0LvQsdC10Log0L/RgNC4INC30LDQutGA0YvRgtC40Lgg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KS5vbigna2V5ZG93bi5zdHlsZXInLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8g0L7RgtC60YDRi9Cy0LDQtdC8INCy0YvQv9Cw0LTQsNGO0YnQuNC5INGB0L/QuNGB0L7QuiDQv9GA0Lgg0L3QsNC20LDRgtC40LggU3BhY2VcclxuXHRcdFx0XHRcdFx0XHRpZiAoZS53aGljaCA9PSAzMikge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGl2U2VsZWN0LmNsaWNrKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC/0YDRj9GH0LXQvCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0Log0L/RgNC4INC60LvQuNC60LUg0LfQsCDQv9GA0LXQtNC10LvQsNC80Lgg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0aWYgKCFvbkRvY3VtZW50Q2xpY2sucmVnaXN0ZXJlZCkge1xyXG5cdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsIG9uRG9jdW1lbnRDbGljayk7XHJcblx0XHRcdFx0XHRcdFx0b25Eb2N1bWVudENsaWNrLnJlZ2lzdGVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0fSAvLyBlbmQgZG9TZWxlY3QoKVxyXG5cclxuXHRcdFx0XHRcdC8vINC80YPQu9GM0YLQuNGB0LXQu9C10LrRglxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24gZG9NdWx0aXBsZVNlbGVjdCgpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGF0dCA9IG5ldyBBdHRyaWJ1dGVzKCk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3Rib3ggPSAkKCc8ZGl2JyArIGF0dC5pZCArICcgY2xhc3M9XCJqcS1zZWxlY3QtbXVsdGlwbGUganFzZWxlY3QnICsgYXR0LmNsYXNzZXMgKyAnXCInICsgYXR0LnRpdGxlICsgJyBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1ibG9jazsgcG9zaXRpb246IHJlbGF0aXZlXCI+PC9kaXY+Jyk7XHJcblxyXG5cdFx0XHRcdFx0XHRlbC5jc3Moe21hcmdpbjogMCwgcGFkZGluZzogMH0pLmFmdGVyKHNlbGVjdGJveCk7XHJcblxyXG5cdFx0XHRcdFx0XHRtYWtlTGlzdCgpO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3Rib3guYXBwZW5kKCc8dWw+JyArIGxpc3QgKyAnPC91bD4nKTtcclxuXHRcdFx0XHRcdFx0dmFyIHVsID0gJCgndWwnLCBzZWxlY3Rib3gpLmNzcyh7XHJcblx0XHRcdFx0XHRcdFx0J3Bvc2l0aW9uJzogJ3JlbGF0aXZlJyxcclxuXHRcdFx0XHRcdFx0XHQnb3ZlcmZsb3cteCc6ICdoaWRkZW4nLFxyXG5cdFx0XHRcdFx0XHRcdCctd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZyc6ICd0b3VjaCdcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdHZhciBsaSA9ICQoJ2xpJywgc2VsZWN0Ym94KS5hdHRyKCd1bnNlbGVjdGFibGUnLCAnb24nKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNpemUgPSBlbC5hdHRyKCdzaXplJyk7XHJcblx0XHRcdFx0XHRcdHZhciB1bEhlaWdodCA9IHVsLm91dGVySGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdHZhciBsaUhlaWdodCA9IGxpLm91dGVySGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdGlmIChzaXplICE9PSB1bmRlZmluZWQgJiYgc2l6ZSA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHR1bC5jc3MoeydoZWlnaHQnOiBsaUhlaWdodCAqIHNpemV9KTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR1bC5jc3MoeydoZWlnaHQnOiBsaUhlaWdodCAqIDR9KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZiAodWxIZWlnaHQgPiBzZWxlY3Rib3guaGVpZ2h0KCkpIHtcclxuXHRcdFx0XHRcdFx0XHR1bC5jc3MoJ292ZXJmbG93WScsICdzY3JvbGwnKTtcclxuXHRcdFx0XHRcdFx0XHRwcmV2ZW50U2Nyb2xsaW5nKHVsKTtcclxuXHRcdFx0XHRcdFx0XHQvLyDQv9GA0L7QutGA0YPRh9C40LLQsNC10Lwg0LTQviDQstGL0LHRgNCw0L3QvdC+0LPQviDQv9GD0L3QutGC0LBcclxuXHRcdFx0XHRcdFx0XHRpZiAobGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCh1bC5zY3JvbGxUb3AoKSArIGxpLmZpbHRlcignLnNlbGVjdGVkJykucG9zaXRpb24oKS50b3ApO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNGP0YfQtdC8INC+0YDQuNCz0LjQvdCw0LvRjNC90YvQuSDRgdC10LvQtdC60YJcclxuXHRcdFx0XHRcdFx0ZWwucHJlcGVuZFRvKHNlbGVjdGJveCkuY3NzKHtcclxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuXHRcdFx0XHRcdFx0XHRsZWZ0OiAwLFxyXG5cdFx0XHRcdFx0XHRcdHRvcDogMCxcclxuXHRcdFx0XHRcdFx0XHR3aWR0aDogJzEwMCUnLFxyXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogJzEwMCUnLFxyXG5cdFx0XHRcdFx0XHRcdG9wYWNpdHk6IDBcclxuXHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDRgdC10LvQtdC60YIg0L3QtdCw0LrRgtC40LLQvdGL0LlcclxuXHRcdFx0XHRcdFx0aWYgKGVsLmlzKCc6ZGlzYWJsZWQnKSkge1xyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRvcHRpb24uZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICgkKHRoaXMpLmlzKCc6c2VsZWN0ZWQnKSkgbGkuZXEoJCh0aGlzKS5pbmRleCgpKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC10YHQu9C4INGB0LXQu9C10LrRgiDQsNC60YLQuNCy0L3Ri9C5XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC/0YDQuCDQutC70LjQutC1INC90LAg0L/Rg9C90LrRgiDRgdC/0LjRgdC60LBcclxuXHRcdFx0XHRcdFx0XHRsaS5maWx0ZXIoJzpub3QoLmRpc2FibGVkKTpub3QoLm9wdGdyb3VwKScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGVsLmZvY3VzKCk7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgY2xrZCA9ICQodGhpcyk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZighZS5jdHJsS2V5ICYmICFlLm1ldGFLZXkpIGNsa2QuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZighZS5zaGlmdEtleSkgY2xrZC5hZGRDbGFzcygnZmlyc3QnKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmKCFlLmN0cmxLZXkgJiYgIWUubWV0YUtleSAmJiAhZS5zaGlmdEtleSkgY2xrZC5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCBmaXJzdCcpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdC8vINCy0YvQtNC10LvQtdC90LjQtSDQv9GD0L3QutGC0L7QsiDQv9GA0Lgg0LfQsNC20LDRgtC+0LwgQ3RybFxyXG5cdFx0XHRcdFx0XHRcdFx0aWYoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY2xrZC5pcygnLnNlbGVjdGVkJykpIGNsa2QucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkIGZpcnN0Jyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBjbGtkLmFkZENsYXNzKCdzZWxlY3RlZCBmaXJzdCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGtkLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2ZpcnN0Jyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Ly8g0LLRi9C00LXQu9C10L3QuNC1INC/0YPQvdC60YLQvtCyINC/0YDQuCDQt9Cw0LbQsNGC0L7QvCBTaGlmdFxyXG5cdFx0XHRcdFx0XHRcdFx0aWYoZS5zaGlmdEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgcHJldiA9IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGtkLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJykuc2libGluZ3MoJy5maXJzdCcpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGtkLnByZXZBbGwoKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkKHRoaXMpLmlzKCcuZmlyc3QnKSkgcHJldiA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGtkLm5leHRBbGwoKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkKHRoaXMpLmlzKCcuZmlyc3QnKSkgbmV4dCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJldikge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsa2QucHJldkFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJCh0aGlzKS5pcygnLnNlbGVjdGVkJykpIHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSAkKHRoaXMpLm5vdCgnLmRpc2FibGVkLCAub3B0Z3JvdXAnKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAobmV4dCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsa2QubmV4dEFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoJCh0aGlzKS5pcygnLnNlbGVjdGVkJykpIHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSAkKHRoaXMpLm5vdCgnLmRpc2FibGVkLCAub3B0Z3JvdXAnKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAobGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS5sZW5ndGggPT0gMSkgY2xrZC5hZGRDbGFzcygnZmlyc3QnKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQvLyDQvtGC0LzQtdGH0LDQtdC8INCy0YvQsdGA0LDQvdC90YvQtSDQvNGL0YjRjNGOXHJcblx0XHRcdFx0XHRcdFx0XHRvcHRpb24ucHJvcCgnc2VsZWN0ZWQnLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRsaS5maWx0ZXIoJy5zZWxlY3RlZCcpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciB0ID0gJCh0aGlzKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGluZGV4ID0gdC5pbmRleCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodC5pcygnLm9wdGlvbicpKSBpbmRleCAtPSB0LnByZXZBbGwoJy5vcHRncm91cCcpLmxlbmd0aDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9uLmVxKGluZGV4KS5wcm9wKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRlbC5jaGFuZ2UoKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC+0YLQvNC10YfQsNC10Lwg0LLRi9Cx0YDQsNC90L3Ri9C1INGBINC60LvQsNCy0LjQsNGC0YPRgNGLXHJcblx0XHRcdFx0XHRcdFx0b3B0aW9uLmVhY2goZnVuY3Rpb24oaSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5kYXRhKCdvcHRpb25JbmRleCcsIGkpO1xyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdGVsLm9uKCdjaGFuZ2Uuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsaS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBhcnJJbmRleGVzID0gW107XHJcblx0XHRcdFx0XHRcdFx0XHRvcHRpb24uZmlsdGVyKCc6c2VsZWN0ZWQnKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhcnJJbmRleGVzLnB1c2goJCh0aGlzKS5kYXRhKCdvcHRpb25JbmRleCcpKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0bGkubm90KCcub3B0Z3JvdXAnKS5maWx0ZXIoZnVuY3Rpb24oaSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gJC5pbkFycmF5KGksIGFyckluZGV4ZXMpID4gLTE7XHJcblx0XHRcdFx0XHRcdFx0XHR9KS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rib3guYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHRcdC5vbignYmx1ci5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZm9jdXNlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQv9GA0L7QutGA0YPRh9C40LLQsNC10Lwg0YEg0LrQu9Cw0LLQuNCw0YLRg9GA0YtcclxuXHRcdFx0XHRcdFx0XHRpZiAodWxIZWlnaHQgPiBzZWxlY3Rib3guaGVpZ2h0KCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGVsLm9uKCdrZXlkb3duLnN0eWxlcicsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8g0LLQstC10YDRhSwg0LLQu9C10LLQviwgUGFnZVVwXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDM4IHx8IGUud2hpY2ggPT0gMzcgfHwgZS53aGljaCA9PSAzMykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCh1bC5zY3JvbGxUb3AoKSArIGxpLmZpbHRlcignLnNlbGVjdGVkJykucG9zaXRpb24oKS50b3AgLSBsaUhlaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8g0LLQvdC40LcsINCy0L/RgNCw0LLQviwgUGFnZURvd25cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGUud2hpY2ggPT0gNDAgfHwgZS53aGljaCA9PSAzOSB8fCBlLndoaWNoID09IDM0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dWwuc2Nyb2xsVG9wKHVsLnNjcm9sbFRvcCgpICsgbGkuZmlsdGVyKCcuc2VsZWN0ZWQ6bGFzdCcpLnBvc2l0aW9uKCkudG9wIC0gdWwuaW5uZXJIZWlnaHQoKSArIGxpSGVpZ2h0ICogMik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gLy8gZW5kIGRvTXVsdGlwbGVTZWxlY3QoKVxyXG5cclxuXHRcdFx0XHRcdGlmIChlbC5pcygnW211bHRpcGxlXScpKSB7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCBBbmRyb2lkINC40LvQuCBpT1MsINGC0L4g0LzRg9C70YzRgtC40YHQtdC70LXQutGCINC90LUg0YHRgtC40LvQuNC30YPQtdC8XHJcblx0XHRcdFx0XHRcdC8vINC/0YDQuNGH0LjQvdCwINC00LvRjyBBbmRyb2lkIC0g0LIg0YHRgtC40LvQuNC30L7QstCw0L3QvdC+0Lwg0YHQtdC70LXQutGC0LUg0L3QtdGCINCy0L7Qt9C80L7QttC90L7RgdGC0Lgg0LLRi9Cx0YDQsNGC0Ywg0L3QtdGB0LrQvtC70YzQutC+INC/0YPQvdC60YLQvtCyXHJcblx0XHRcdFx0XHRcdC8vINC/0YDQuNGH0LjQvdCwINC00LvRjyBpT1MgLSDQsiDRgdGC0LjQu9C40LfQvtCy0LDQvdC90L7QvCDRgdC10LvQtdC60YLQtSDQvdC10L/RgNCw0LLQuNC70YzQvdC+INC+0YLQvtCx0YDQsNC20LDRjtGC0YHRjyDQstGL0LHRgNCw0L3QvdGL0LUg0L/Rg9C90LrRgtGLXHJcblx0XHRcdFx0XHRcdGlmIChBbmRyb2lkIHx8IGlPUykgcmV0dXJuO1xyXG5cclxuXHRcdFx0XHRcdFx0ZG9NdWx0aXBsZVNlbGVjdCgpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0ZG9TZWxlY3QoKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fTsgLy8gZW5kIHNlbGVjdGJveE91dHB1dCgpXHJcblxyXG5cdFx0XHRcdHNlbGVjdGJveE91dHB1dCgpO1xyXG5cclxuXHRcdFx0XHQvLyDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9GA0Lgg0LTQuNC90LDQvNC40YfQtdGB0LrQvtC8INC40LfQvNC10L3QtdC90LjQuFxyXG5cdFx0XHRcdGVsLm9uKCdyZWZyZXNoJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRlbC5vZmYoJy5zdHlsZXInKS5wYXJlbnQoKS5iZWZvcmUoZWwpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0c2VsZWN0Ym94T3V0cHV0KCk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBlbmQgc2VsZWN0XHJcblxyXG5cdFx0XHQvLyByZXNldFxyXG5cdFx0XHR9IGVsc2UgaWYgKGVsLmlzKCc6cmVzZXQnKSkge1xyXG5cdFx0XHRcdGVsLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0ZWwuY2xvc2VzdChvcHQud3JhcHBlcikuZmluZCgnaW5wdXQsIHNlbGVjdCcpLnRyaWdnZXIoJ3JlZnJlc2gnKTtcclxuXHRcdFx0XHRcdH0sIDEpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IC8vIGVuZCByZXNldFxyXG5cclxuXHRcdH0sIC8vIGluaXQ6IGZ1bmN0aW9uKClcclxuXHJcblx0XHQvLyDQtNC10YHRgtGA0YPQutGC0L7RgFxyXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR2YXIgZWwgPSAkKHRoaXMuZWxlbWVudCk7XHJcblxyXG5cdFx0XHRpZiAoZWwuaXMoJzpjaGVja2JveCcpIHx8IGVsLmlzKCc6cmFkaW8nKSkge1xyXG5cdFx0XHRcdGVsLnJlbW92ZURhdGEoJ18nICsgcGx1Z2luTmFtZSkub2ZmKCcuc3R5bGVyIHJlZnJlc2gnKS5yZW1vdmVBdHRyKCdzdHlsZScpLnBhcmVudCgpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdFx0ZWwuY2xvc2VzdCgnbGFiZWwnKS5hZGQoJ2xhYmVsW2Zvcj1cIicgKyBlbC5hdHRyKCdpZCcpICsgJ1wiXScpLm9mZignLnN0eWxlcicpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGVsLmlzKCdpbnB1dFt0eXBlPVwibnVtYmVyXCJdJykpIHtcclxuXHRcdFx0XHRlbC5yZW1vdmVEYXRhKCdfJyArIHBsdWdpbk5hbWUpLm9mZignLnN0eWxlciByZWZyZXNoJykuY2xvc2VzdCgnLmpxLW51bWJlcicpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdH0gZWxzZSBpZiAoZWwuaXMoJzpmaWxlJykgfHwgZWwuaXMoJ3NlbGVjdCcpKSB7XHJcblx0XHRcdFx0ZWwucmVtb3ZlRGF0YSgnXycgKyBwbHVnaW5OYW1lKS5vZmYoJy5zdHlsZXIgcmVmcmVzaCcpLnJlbW92ZUF0dHIoJ3N0eWxlJykucGFyZW50KCkuYmVmb3JlKGVsKS5yZW1vdmUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gLy8gZGVzdHJveTogZnVuY3Rpb24oKVxyXG5cclxuXHR9OyAvLyBQbHVnaW4ucHJvdG90eXBlXHJcblxyXG5cdCQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuXHRcdGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoISQuZGF0YSh0aGlzLCAnXycgKyBwbHVnaW5OYW1lKSkge1xyXG5cdFx0XHRcdFx0JC5kYXRhKHRoaXMsICdfJyArIHBsdWdpbk5hbWUsIG5ldyBQbHVnaW4odGhpcywgb3B0aW9ucykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0Ly8g0LrQvtC70LHQtdC6INC/0L7RgdC70LUg0LLRi9C/0L7Qu9C90LXQvdC40Y8g0L/Qu9Cw0LPQuNC90LBcclxuXHRcdFx0LnByb21pc2UoKVxyXG5cdFx0XHQuZG9uZShmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgb3B0ID0gJCh0aGlzWzBdKS5kYXRhKCdfJyArIHBsdWdpbk5hbWUpO1xyXG5cdFx0XHRcdGlmIChvcHQpIG9wdC5vcHRpb25zLm9uRm9ybVN0eWxlZC5jYWxsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnICYmIG9wdGlvbnNbMF0gIT09ICdfJyAmJiBvcHRpb25zICE9PSAnaW5pdCcpIHtcclxuXHRcdFx0dmFyIHJldHVybnM7XHJcblx0XHRcdHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgJ18nICsgcGx1Z2luTmFtZSk7XHJcblx0XHRcdFx0aWYgKGluc3RhbmNlIGluc3RhbmNlb2YgUGx1Z2luICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0cmV0dXJucyA9IGluc3RhbmNlW29wdGlvbnNdLmFwcGx5KGluc3RhbmNlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLCAxKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHJldHVybnMgIT09IHVuZGVmaW5lZCA/IHJldHVybnMgOiB0aGlzO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vINC/0YDRj9GH0LXQvCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0Log0L/RgNC4INC60LvQuNC60LUg0LfQsCDQv9GA0LXQtNC10LvQsNC80Lgg0YHQtdC70LXQutGC0LBcclxuXHRmdW5jdGlvbiBvbkRvY3VtZW50Q2xpY2soZSkge1xyXG5cdFx0Ly8gZS50YXJnZXQubm9kZU5hbWUgIT0gJ09QVElPTicgLSDQtNC+0LHQsNCy0LvQtdC90L4g0LTQu9GPINC+0LHRhdC+0LTQsCDQsdCw0LPQsCDQsiBPcGVyYSDQvdCwINC00LLQuNC20LrQtSBQcmVzdG9cclxuXHRcdC8vICjQv9GA0Lgg0LjQt9C80LXQvdC10L3QuNC4INGB0LXQu9C10LrRgtCwINGBINC60LvQsNCy0LjQsNGC0YPRgNGLINGB0YDQsNCx0LDRgtGL0LLQsNC10YIg0YHQvtCx0YvRgtC40LUgb25jbGljaylcclxuXHRcdGlmICghJChlLnRhcmdldCkucGFyZW50cygpLmhhc0NsYXNzKCdqcS1zZWxlY3Rib3gnKSAmJiBlLnRhcmdldC5ub2RlTmFtZSAhPSAnT1BUSU9OJykge1xyXG5cdFx0XHRpZiAoJCgnZGl2LmpxLXNlbGVjdGJveC5vcGVuZWQnKS5sZW5ndGgpIHtcclxuXHRcdFx0XHR2YXIgc2VsZWN0Ym94ID0gJCgnZGl2LmpxLXNlbGVjdGJveC5vcGVuZWQnKSxcclxuXHRcdFx0XHRcdFx0c2VhcmNoID0gJCgnZGl2LmpxLXNlbGVjdGJveF9fc2VhcmNoIGlucHV0Jywgc2VsZWN0Ym94KSxcclxuXHRcdFx0XHRcdFx0ZHJvcGRvd24gPSAkKCdkaXYuanEtc2VsZWN0Ym94X19kcm9wZG93bicsIHNlbGVjdGJveCksXHJcblx0XHRcdFx0XHRcdG9wdCA9IHNlbGVjdGJveC5maW5kKCdzZWxlY3QnKS5kYXRhKCdfJyArIHBsdWdpbk5hbWUpLm9wdGlvbnM7XHJcblxyXG5cdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0LfQsNC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblxyXG5cdFx0XHRcdGlmIChzZWFyY2gubGVuZ3RoKSBzZWFyY2gudmFsKCcnKS5rZXl1cCgpO1xyXG5cdFx0XHRcdGRyb3Bkb3duLmhpZGUoKS5maW5kKCdsaS5zZWwnKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRzZWxlY3Rib3gucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQgb3BlbmVkIGRyb3B1cCBkcm9wZG93bicpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdG9uRG9jdW1lbnRDbGljay5yZWdpc3RlcmVkID0gZmFsc2U7XHJcblxyXG59KSk7IiwiLyogalF1ZXJ5IEZvcm0gU3R5bGVyIHYxLjcuNCB8IChjKSBEaW1veCB8IGh0dHBzOi8vZ2l0aHViLmNvbS9EaW1veC9qUXVlcnlGb3JtU3R5bGVyICovXG4oZnVuY3Rpb24oYil7XCJmdW5jdGlvblwiPT09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wianF1ZXJ5XCJdLGIpOlwib2JqZWN0XCI9PT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1iKHJlcXVpcmUoXCJqcXVlcnlcIikpOmIoalF1ZXJ5KX0pKGZ1bmN0aW9uKGIpe2Z1bmN0aW9uIHooYyxhKXt0aGlzLmVsZW1lbnQ9Yzt0aGlzLm9wdGlvbnM9Yi5leHRlbmQoe30sTixhKTt0aGlzLmluaXQoKX1mdW5jdGlvbiBHKGMpe2lmKCFiKGMudGFyZ2V0KS5wYXJlbnRzKCkuaGFzQ2xhc3MoXCJqcS1zZWxlY3Rib3hcIikmJlwiT1BUSU9OXCIhPWMudGFyZ2V0Lm5vZGVOYW1lJiZiKFwiZGl2LmpxLXNlbGVjdGJveC5vcGVuZWRcIikubGVuZ3RoKXtjPWIoXCJkaXYuanEtc2VsZWN0Ym94Lm9wZW5lZFwiKTt2YXIgYT1iKFwiZGl2LmpxLXNlbGVjdGJveF9fc2VhcmNoIGlucHV0XCIsYyksZj1iKFwiZGl2LmpxLXNlbGVjdGJveF9fZHJvcGRvd25cIixjKTtjLmZpbmQoXCJzZWxlY3RcIikuZGF0YShcIl9cIitcbmgpLm9wdGlvbnMub25TZWxlY3RDbG9zZWQuY2FsbChjKTthLmxlbmd0aCYmYS52YWwoXCJcIikua2V5dXAoKTtmLmhpZGUoKS5maW5kKFwibGkuc2VsXCIpLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7Yy5yZW1vdmVDbGFzcyhcImZvY3VzZWQgb3BlbmVkIGRyb3B1cCBkcm9wZG93blwiKX19dmFyIGg9XCJzdHlsZXJcIixOPXt3cmFwcGVyOlwiZm9ybVwiLGlkU3VmZml4OlwiLXN0eWxlclwiLGZpbGVQbGFjZWhvbGRlcjpcIlxcdTA0MjRcXHUwNDMwXFx1MDQzOVxcdTA0M2IgXFx1MDQzZFxcdTA0MzUgXFx1MDQzMlxcdTA0NGJcXHUwNDMxXFx1MDQ0MFxcdTA0MzBcXHUwNDNkXCIsZmlsZUJyb3dzZTpcIlxcdTA0MWVcXHUwNDMxXFx1MDQzN1xcdTA0M2VcXHUwNDQwLi4uXCIsZmlsZU51bWJlcjpcIlxcdTA0MTJcXHUwNDRiXFx1MDQzMVxcdTA0NDBcXHUwNDMwXFx1MDQzZFxcdTA0M2UgXFx1MDQ0NFxcdTA0MzBcXHUwNDM5XFx1MDQzYlxcdTA0M2VcXHUwNDMyOiAlc1wiLHNlbGVjdFBsYWNlaG9sZGVyOlwiXFx1MDQxMlxcdTA0NGJcXHUwNDMxXFx1MDQzNVxcdTA0NDBcXHUwNDM4XFx1MDQ0MlxcdTA0MzUuLi5cIixcbnNlbGVjdFNlYXJjaDohMSxzZWxlY3RTZWFyY2hMaW1pdDoxMCxzZWxlY3RTZWFyY2hOb3RGb3VuZDpcIlxcdTA0MjFcXHUwNDNlXFx1MDQzMlxcdTA0M2ZcXHUwNDMwXFx1MDQzNFxcdTA0MzVcXHUwNDNkXFx1MDQzOFxcdTA0MzkgXFx1MDQzZFxcdTA0MzUgXFx1MDQzZFxcdTA0MzBcXHUwNDM5XFx1MDQzNFxcdTA0MzVcXHUwNDNkXFx1MDQzZVwiLHNlbGVjdFNlYXJjaFBsYWNlaG9sZGVyOlwiXFx1MDQxZlxcdTA0M2VcXHUwNDM4XFx1MDQ0MVxcdTA0M2EuLi5cIixzZWxlY3RWaXNpYmxlT3B0aW9uczowLHNpbmdsZVNlbGVjdHpJbmRleDpcIjEwMFwiLHNlbGVjdFNtYXJ0UG9zaXRpb25pbmc6ITAsb25TZWxlY3RPcGVuZWQ6ZnVuY3Rpb24oKXt9LG9uU2VsZWN0Q2xvc2VkOmZ1bmN0aW9uKCl7fSxvbkZvcm1TdHlsZWQ6ZnVuY3Rpb24oKXt9fTt6LnByb3RvdHlwZT17aW5pdDpmdW5jdGlvbigpe2Z1bmN0aW9uIGMoKXt2YXIgYj1cIlwiLGQ9XCJcIixjPVwiXCIsZT1cIlwiO3ZvaWQgMCE9PWEuYXR0cihcImlkXCIpJiZcIlwiIT09YS5hdHRyKFwiaWRcIikmJlxuKGI9JyBpZD1cIicrYS5hdHRyKFwiaWRcIikrZi5pZFN1ZmZpeCsnXCInKTt2b2lkIDAhPT1hLmF0dHIoXCJ0aXRsZVwiKSYmXCJcIiE9PWEuYXR0cihcInRpdGxlXCIpJiYoZD0nIHRpdGxlPVwiJythLmF0dHIoXCJ0aXRsZVwiKSsnXCInKTt2b2lkIDAhPT1hLmF0dHIoXCJjbGFzc1wiKSYmXCJcIiE9PWEuYXR0cihcImNsYXNzXCIpJiYoYz1cIiBcIithLmF0dHIoXCJjbGFzc1wiKSk7dmFyIGw9YS5kYXRhKCksdDtmb3IodCBpbiBsKVwiXCIhPT1sW3RdJiZcIl9zdHlsZXJcIiE9PXQmJihlKz1cIiBkYXRhLVwiK3QrJz1cIicrbFt0XSsnXCInKTt0aGlzLmlkPWIrZTt0aGlzLnRpdGxlPWQ7dGhpcy5jbGFzc2VzPWN9dmFyIGE9Yih0aGlzLmVsZW1lbnQpLGY9dGhpcy5vcHRpb25zLHk9bmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKGlQYWR8aVBob25lfGlQb2QpL2kpJiYhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKFdpbmRvd3NcXHNQaG9uZSkvaSk/ITA6ITEsaD1uYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpJiZcbiFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oV2luZG93c1xcc1Bob25lKS9pKT8hMDohMTtpZihhLmlzKFwiOmNoZWNrYm94XCIpKXt2YXIgej1mdW5jdGlvbigpe3ZhciBmPW5ldyBjLGQ9YihcIjxkaXZcIitmLmlkKycgY2xhc3M9XCJqcS1jaGVja2JveCcrZi5jbGFzc2VzKydcIicrZi50aXRsZSsnPjxkaXYgY2xhc3M9XCJqcS1jaGVja2JveF9fZGl2XCI+PC9kaXY+PC9kaXY+Jyk7YS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix6SW5kZXg6XCItMVwiLG9wYWNpdHk6MCxtYXJnaW46MCxwYWRkaW5nOjB9KS5hZnRlcihkKS5wcmVwZW5kVG8oZCk7ZC5hdHRyKFwidW5zZWxlY3RhYmxlXCIsXCJvblwiKS5jc3Moe1wiLXdlYmtpdC11c2VyLXNlbGVjdFwiOlwibm9uZVwiLFwiLW1vei11c2VyLXNlbGVjdFwiOlwibm9uZVwiLFwiLW1zLXVzZXItc2VsZWN0XCI6XCJub25lXCIsXCItby11c2VyLXNlbGVjdFwiOlwibm9uZVwiLFwidXNlci1zZWxlY3RcIjpcIm5vbmVcIixkaXNwbGF5OlwiaW5saW5lLWJsb2NrXCIscG9zaXRpb246XCJyZWxhdGl2ZVwiLFxub3ZlcmZsb3c6XCJoaWRkZW5cIn0pO2EuaXMoXCI6Y2hlY2tlZFwiKSYmZC5hZGRDbGFzcyhcImNoZWNrZWRcIik7YS5pcyhcIjpkaXNhYmxlZFwiKSYmZC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO2QuY2xpY2soZnVuY3Rpb24oYil7Yi5wcmV2ZW50RGVmYXVsdCgpO2QuaXMoXCIuZGlzYWJsZWRcIil8fChhLmlzKFwiOmNoZWNrZWRcIik/KGEucHJvcChcImNoZWNrZWRcIiwhMSksZC5yZW1vdmVDbGFzcyhcImNoZWNrZWRcIikpOihhLnByb3AoXCJjaGVja2VkXCIsITApLGQuYWRkQ2xhc3MoXCJjaGVja2VkXCIpKSxhLmZvY3VzKCkuY2hhbmdlKCkpfSk7YS5jbG9zZXN0KFwibGFiZWxcIikuYWRkKCdsYWJlbFtmb3I9XCInK2EuYXR0cihcImlkXCIpKydcIl0nKS5vbihcImNsaWNrLnN0eWxlclwiLGZ1bmN0aW9uKGEpe2IoYS50YXJnZXQpLmlzKFwiYVwiKXx8YihhLnRhcmdldCkuY2xvc2VzdChkKS5sZW5ndGh8fChkLnRyaWdnZXJIYW5kbGVyKFwiY2xpY2tcIiksYS5wcmV2ZW50RGVmYXVsdCgpKX0pO2Eub24oXCJjaGFuZ2Uuc3R5bGVyXCIsXG5mdW5jdGlvbigpe2EuaXMoXCI6Y2hlY2tlZFwiKT9kLmFkZENsYXNzKFwiY2hlY2tlZFwiKTpkLnJlbW92ZUNsYXNzKFwiY2hlY2tlZFwiKX0pLm9uKFwia2V5ZG93bi5zdHlsZXJcIixmdW5jdGlvbihhKXszMj09YS53aGljaCYmZC5jbGljaygpfSkub24oXCJmb2N1cy5zdHlsZXJcIixmdW5jdGlvbigpe2QuaXMoXCIuZGlzYWJsZWRcIil8fGQuYWRkQ2xhc3MoXCJmb2N1c2VkXCIpfSkub24oXCJibHVyLnN0eWxlclwiLGZ1bmN0aW9uKCl7ZC5yZW1vdmVDbGFzcyhcImZvY3VzZWRcIil9KX07eigpO2Eub24oXCJyZWZyZXNoXCIsZnVuY3Rpb24oKXthLmNsb3Nlc3QoXCJsYWJlbFwiKS5hZGQoJ2xhYmVsW2Zvcj1cIicrYS5hdHRyKFwiaWRcIikrJ1wiXScpLm9mZihcIi5zdHlsZXJcIik7YS5vZmYoXCIuc3R5bGVyXCIpLnBhcmVudCgpLmJlZm9yZShhKS5yZW1vdmUoKTt6KCl9KX1lbHNlIGlmKGEuaXMoXCI6cmFkaW9cIikpe3ZhciBCPWZ1bmN0aW9uKCl7dmFyIHg9bmV3IGMsZD1iKFwiPGRpdlwiK3guaWQrJyBjbGFzcz1cImpxLXJhZGlvJytcbnguY2xhc3NlcysnXCInK3gudGl0bGUrJz48ZGl2IGNsYXNzPVwianEtcmFkaW9fX2RpdlwiPjwvZGl2PjwvZGl2PicpO2EuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsekluZGV4OlwiLTFcIixvcGFjaXR5OjAsbWFyZ2luOjAscGFkZGluZzowfSkuYWZ0ZXIoZCkucHJlcGVuZFRvKGQpO2QuYXR0cihcInVuc2VsZWN0YWJsZVwiLFwib25cIikuY3NzKHtcIi13ZWJraXQtdXNlci1zZWxlY3RcIjpcIm5vbmVcIixcIi1tb3otdXNlci1zZWxlY3RcIjpcIm5vbmVcIixcIi1tcy11c2VyLXNlbGVjdFwiOlwibm9uZVwiLFwiLW8tdXNlci1zZWxlY3RcIjpcIm5vbmVcIixcInVzZXItc2VsZWN0XCI6XCJub25lXCIsZGlzcGxheTpcImlubGluZS1ibG9ja1wiLHBvc2l0aW9uOlwicmVsYXRpdmVcIn0pO2EuaXMoXCI6Y2hlY2tlZFwiKSYmZC5hZGRDbGFzcyhcImNoZWNrZWRcIik7YS5pcyhcIjpkaXNhYmxlZFwiKSYmZC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO2QuY2xpY2soZnVuY3Rpb24oYil7Yi5wcmV2ZW50RGVmYXVsdCgpO2QuaXMoXCIuZGlzYWJsZWRcIil8fFxuKGQuY2xvc2VzdChmLndyYXBwZXIpLmZpbmQoJ2lucHV0W25hbWU9XCInK2EuYXR0cihcIm5hbWVcIikrJ1wiXScpLnByb3AoXCJjaGVja2VkXCIsITEpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiY2hlY2tlZFwiKSxhLnByb3AoXCJjaGVja2VkXCIsITApLnBhcmVudCgpLmFkZENsYXNzKFwiY2hlY2tlZFwiKSxhLmZvY3VzKCkuY2hhbmdlKCkpfSk7YS5jbG9zZXN0KFwibGFiZWxcIikuYWRkKCdsYWJlbFtmb3I9XCInK2EuYXR0cihcImlkXCIpKydcIl0nKS5vbihcImNsaWNrLnN0eWxlclwiLGZ1bmN0aW9uKGEpe2IoYS50YXJnZXQpLmlzKFwiYVwiKXx8YihhLnRhcmdldCkuY2xvc2VzdChkKS5sZW5ndGh8fChkLnRyaWdnZXJIYW5kbGVyKFwiY2xpY2tcIiksYS5wcmV2ZW50RGVmYXVsdCgpKX0pO2Eub24oXCJjaGFuZ2Uuc3R5bGVyXCIsZnVuY3Rpb24oKXthLnBhcmVudCgpLmFkZENsYXNzKFwiY2hlY2tlZFwiKX0pLm9uKFwiZm9jdXMuc3R5bGVyXCIsZnVuY3Rpb24oKXtkLmlzKFwiLmRpc2FibGVkXCIpfHxkLmFkZENsYXNzKFwiZm9jdXNlZFwiKX0pLm9uKFwiYmx1ci5zdHlsZXJcIixcbmZ1bmN0aW9uKCl7ZC5yZW1vdmVDbGFzcyhcImZvY3VzZWRcIil9KX07QigpO2Eub24oXCJyZWZyZXNoXCIsZnVuY3Rpb24oKXthLmNsb3Nlc3QoXCJsYWJlbFwiKS5hZGQoJ2xhYmVsW2Zvcj1cIicrYS5hdHRyKFwiaWRcIikrJ1wiXScpLm9mZihcIi5zdHlsZXJcIik7YS5vZmYoXCIuc3R5bGVyXCIpLnBhcmVudCgpLmJlZm9yZShhKS5yZW1vdmUoKTtCKCl9KX1lbHNlIGlmKGEuaXMoXCI6ZmlsZVwiKSl7YS5jc3Moe3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix0b3A6MCxyaWdodDowLHdpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIixvcGFjaXR5OjAsbWFyZ2luOjAscGFkZGluZzowfSk7dmFyIEM9ZnVuY3Rpb24oKXt2YXIgeD1uZXcgYyxkPWEuZGF0YShcInBsYWNlaG9sZGVyXCIpO3ZvaWQgMD09PWQmJihkPWYuZmlsZVBsYWNlaG9sZGVyKTt2YXIgQT1hLmRhdGEoXCJicm93c2VcIik7aWYodm9pZCAwPT09QXx8XCJcIj09PUEpQT1mLmZpbGVCcm93c2U7dmFyIGU9YihcIjxkaXZcIit4LmlkKycgY2xhc3M9XCJqcS1maWxlJyt4LmNsYXNzZXMrXG4nXCInK3gudGl0bGUrJyBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1ibG9jazsgcG9zaXRpb246IHJlbGF0aXZlOyBvdmVyZmxvdzogaGlkZGVuXCI+PC9kaXY+JyksbD1iKCc8ZGl2IGNsYXNzPVwianEtZmlsZV9fbmFtZVwiPicrZCtcIjwvZGl2PlwiKS5hcHBlbmRUbyhlKTtiKCc8ZGl2IGNsYXNzPVwianEtZmlsZV9fYnJvd3NlXCI+JytBK1wiPC9kaXY+XCIpLmFwcGVuZFRvKGUpO2EuYWZ0ZXIoZSkuYXBwZW5kVG8oZSk7YS5pcyhcIjpkaXNhYmxlZFwiKSYmZS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO2Eub24oXCJjaGFuZ2Uuc3R5bGVyXCIsZnVuY3Rpb24oKXt2YXIgYj1hLnZhbCgpO2lmKGEuaXMoXCJbbXVsdGlwbGVdXCIpKXt2YXIgYj1cIlwiLGM9YVswXS5maWxlcy5sZW5ndGg7MDxjJiYoYj1hLmRhdGEoXCJudW1iZXJcIiksdm9pZCAwPT09YiYmKGI9Zi5maWxlTnVtYmVyKSxiPWIucmVwbGFjZShcIiVzXCIsYykpfWwudGV4dChiLnJlcGxhY2UoLy4rW1xcXFxcXC9dLyxcIlwiKSk7XCJcIj09PWI/KGwudGV4dChkKSxlLnJlbW92ZUNsYXNzKFwiY2hhbmdlZFwiKSk6XG5lLmFkZENsYXNzKFwiY2hhbmdlZFwiKX0pLm9uKFwiZm9jdXMuc3R5bGVyXCIsZnVuY3Rpb24oKXtlLmFkZENsYXNzKFwiZm9jdXNlZFwiKX0pLm9uKFwiYmx1ci5zdHlsZXJcIixmdW5jdGlvbigpe2UucmVtb3ZlQ2xhc3MoXCJmb2N1c2VkXCIpfSkub24oXCJjbGljay5zdHlsZXJcIixmdW5jdGlvbigpe2UucmVtb3ZlQ2xhc3MoXCJmb2N1c2VkXCIpfSl9O0MoKTthLm9uKFwicmVmcmVzaFwiLGZ1bmN0aW9uKCl7YS5vZmYoXCIuc3R5bGVyXCIpLnBhcmVudCgpLmJlZm9yZShhKS5yZW1vdmUoKTtDKCl9KX1lbHNlIGlmKGEuaXMoJ2lucHV0W3R5cGU9XCJudW1iZXJcIl0nKSl7dmFyIEQ9ZnVuY3Rpb24oKXt2YXIgYz1iKCc8ZGl2IGNsYXNzPVwianEtbnVtYmVyXCI+PGRpdiBjbGFzcz1cImpxLW51bWJlcl9fc3BpbiBtaW51c1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJqcS1udW1iZXJfX3NwaW4gcGx1c1wiPjwvZGl2PjwvZGl2PicpO2EuYWZ0ZXIoYykucHJlcGVuZFRvKGMpLndyYXAoJzxkaXYgY2xhc3M9XCJqcS1udW1iZXJfX2ZpZWxkXCI+PC9kaXY+Jyk7XG5hLmlzKFwiOmRpc2FibGVkXCIpJiZjLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7dmFyIGQsZixlLGw9bnVsbCx0PW51bGw7dm9pZCAwIT09YS5hdHRyKFwibWluXCIpJiYoZD1hLmF0dHIoXCJtaW5cIikpO3ZvaWQgMCE9PWEuYXR0cihcIm1heFwiKSYmKGY9YS5hdHRyKFwibWF4XCIpKTtlPXZvaWQgMCE9PWEuYXR0cihcInN0ZXBcIikmJmIuaXNOdW1lcmljKGEuYXR0cihcInN0ZXBcIikpP051bWJlcihhLmF0dHIoXCJzdGVwXCIpKTpOdW1iZXIoMSk7dmFyIEs9ZnVuY3Rpb24ocyl7dmFyIGM9YS52YWwoKSxrO2IuaXNOdW1lcmljKGMpfHwoYz0wLGEudmFsKFwiMFwiKSk7cy5pcyhcIi5taW51c1wiKT8oaz1wYXJzZUludChjLDEwKS1lLDA8ZSYmKGs9TWF0aC5jZWlsKGsvZSkqZSkpOnMuaXMoXCIucGx1c1wiKSYmKGs9cGFyc2VJbnQoYywxMCkrZSwwPGUmJihrPU1hdGguZmxvb3Ioay9lKSplKSk7Yi5pc051bWVyaWMoZCkmJmIuaXNOdW1lcmljKGYpP2s+PWQmJms8PWYmJmEudmFsKGspOmIuaXNOdW1lcmljKGQpJiYhYi5pc051bWVyaWMoZik/XG5rPj1kJiZhLnZhbChrKTohYi5pc051bWVyaWMoZCkmJmIuaXNOdW1lcmljKGYpP2s8PWYmJmEudmFsKGspOmEudmFsKGspfTtjLmlzKFwiLmRpc2FibGVkXCIpfHwoYy5vbihcIm1vdXNlZG93blwiLFwiZGl2LmpxLW51bWJlcl9fc3BpblwiLGZ1bmN0aW9uKCl7dmFyIGE9Yih0aGlzKTtLKGEpO2w9c2V0VGltZW91dChmdW5jdGlvbigpe3Q9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtLKGEpfSw0MCl9LDM1MCl9KS5vbihcIm1vdXNldXAgbW91c2VvdXRcIixcImRpdi5qcS1udW1iZXJfX3NwaW5cIixmdW5jdGlvbigpe2NsZWFyVGltZW91dChsKTtjbGVhckludGVydmFsKHQpfSksYS5vbihcImZvY3VzLnN0eWxlclwiLGZ1bmN0aW9uKCl7Yy5hZGRDbGFzcyhcImZvY3VzZWRcIil9KS5vbihcImJsdXIuc3R5bGVyXCIsZnVuY3Rpb24oKXtjLnJlbW92ZUNsYXNzKFwiZm9jdXNlZFwiKX0pKX07RCgpO2Eub24oXCJyZWZyZXNoXCIsZnVuY3Rpb24oKXthLm9mZihcIi5zdHlsZXJcIikuY2xvc2VzdChcIi5qcS1udW1iZXJcIikuYmVmb3JlKGEpLnJlbW92ZSgpO1xuRCgpfSl9ZWxzZSBpZihhLmlzKFwic2VsZWN0XCIpKXt2YXIgTT1mdW5jdGlvbigpe2Z1bmN0aW9uIHgoYSl7YS5vZmYoXCJtb3VzZXdoZWVsIERPTU1vdXNlU2Nyb2xsXCIpLm9uKFwibW91c2V3aGVlbCBET01Nb3VzZVNjcm9sbFwiLGZ1bmN0aW9uKGEpe3ZhciBjPW51bGw7XCJtb3VzZXdoZWVsXCI9PWEudHlwZT9jPS0xKmEub3JpZ2luYWxFdmVudC53aGVlbERlbHRhOlwiRE9NTW91c2VTY3JvbGxcIj09YS50eXBlJiYoYz00MCphLm9yaWdpbmFsRXZlbnQuZGV0YWlsKTtjJiYoYS5zdG9wUHJvcGFnYXRpb24oKSxhLnByZXZlbnREZWZhdWx0KCksYih0aGlzKS5zY3JvbGxUb3AoYytiKHRoaXMpLnNjcm9sbFRvcCgpKSl9KX1mdW5jdGlvbiBkKCl7Zm9yKHZhciBhPTA7YTxsLmxlbmd0aDthKyspe3ZhciBiPWwuZXEoYSksYz1cIlwiLGQ9XCJcIixlPWM9XCJcIix1PVwiXCIscD1cIlwiLHY9XCJcIix3PVwiXCIsZz1cIlwiO2IucHJvcChcInNlbGVjdGVkXCIpJiYoZD1cInNlbGVjdGVkIHNlbFwiKTtiLmlzKFwiOmRpc2FibGVkXCIpJiZcbihkPVwiZGlzYWJsZWRcIik7Yi5pcyhcIjpzZWxlY3RlZDpkaXNhYmxlZFwiKSYmKGQ9XCJzZWxlY3RlZCBzZWwgZGlzYWJsZWRcIik7dm9pZCAwIT09Yi5hdHRyKFwiaWRcIikmJlwiXCIhPT1iLmF0dHIoXCJpZFwiKSYmKGU9JyBpZD1cIicrYi5hdHRyKFwiaWRcIikrZi5pZFN1ZmZpeCsnXCInKTt2b2lkIDAhPT1iLmF0dHIoXCJ0aXRsZVwiKSYmXCJcIiE9PWwuYXR0cihcInRpdGxlXCIpJiYodT0nIHRpdGxlPVwiJytiLmF0dHIoXCJ0aXRsZVwiKSsnXCInKTt2b2lkIDAhPT1iLmF0dHIoXCJjbGFzc1wiKSYmKHY9XCIgXCIrYi5hdHRyKFwiY2xhc3NcIiksZz0nIGRhdGEtanFmcy1jbGFzcz1cIicrYi5hdHRyKFwiY2xhc3NcIikrJ1wiJyk7dmFyIGg9Yi5kYXRhKCkscjtmb3IociBpbiBoKVwiXCIhPT1oW3JdJiYocCs9XCIgZGF0YS1cIityKyc9XCInK2hbcl0rJ1wiJyk7XCJcIiE9PWQrdiYmKGM9JyBjbGFzcz1cIicrZCt2KydcIicpO2M9XCI8bGlcIitnK3ArYyt1K2UrXCI+XCIrYi5odG1sKCkrXCI8L2xpPlwiO2IucGFyZW50KCkuaXMoXCJvcHRncm91cFwiKSYmKHZvaWQgMCE9PVxuYi5wYXJlbnQoKS5hdHRyKFwiY2xhc3NcIikmJih3PVwiIFwiK2IucGFyZW50KCkuYXR0cihcImNsYXNzXCIpKSxjPVwiPGxpXCIrZytwKycgY2xhc3M9XCInK2QrditcIiBvcHRpb25cIit3KydcIicrdStlK1wiPlwiK2IuaHRtbCgpK1wiPC9saT5cIixiLmlzKFwiOmZpcnN0LWNoaWxkXCIpJiYoYz0nPGxpIGNsYXNzPVwib3B0Z3JvdXAnK3crJ1wiPicrYi5wYXJlbnQoKS5hdHRyKFwibGFiZWxcIikrXCI8L2xpPlwiK2MpKTt0Kz1jfX1mdW5jdGlvbiB6KCl7dmFyIGU9bmV3IGMscz1cIlwiLEg9YS5kYXRhKFwicGxhY2Vob2xkZXJcIiksaz1hLmRhdGEoXCJzZWFyY2hcIiksaD1hLmRhdGEoXCJzZWFyY2gtbGltaXRcIiksdT1hLmRhdGEoXCJzZWFyY2gtbm90LWZvdW5kXCIpLHA9YS5kYXRhKFwic2VhcmNoLXBsYWNlaG9sZGVyXCIpLHY9YS5kYXRhKFwiei1pbmRleFwiKSx3PWEuZGF0YShcInNtYXJ0LXBvc2l0aW9uaW5nXCIpO3ZvaWQgMD09PUgmJihIPWYuc2VsZWN0UGxhY2Vob2xkZXIpO2lmKHZvaWQgMD09PWt8fFwiXCI9PT1rKWs9Zi5zZWxlY3RTZWFyY2g7XG5pZih2b2lkIDA9PT1ofHxcIlwiPT09aCloPWYuc2VsZWN0U2VhcmNoTGltaXQ7aWYodm9pZCAwPT09dXx8XCJcIj09PXUpdT1mLnNlbGVjdFNlYXJjaE5vdEZvdW5kO3ZvaWQgMD09PXAmJihwPWYuc2VsZWN0U2VhcmNoUGxhY2Vob2xkZXIpO2lmKHZvaWQgMD09PXZ8fFwiXCI9PT12KXY9Zi5zaW5nbGVTZWxlY3R6SW5kZXg7aWYodm9pZCAwPT09d3x8XCJcIj09PXcpdz1mLnNlbGVjdFNtYXJ0UG9zaXRpb25pbmc7dmFyIGc9YihcIjxkaXZcIitlLmlkKycgY2xhc3M9XCJqcS1zZWxlY3Rib3gganFzZWxlY3QnK2UuY2xhc3NlcysnXCIgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHBvc2l0aW9uOiByZWxhdGl2ZTsgei1pbmRleDonK3YrJ1wiPjxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3NlbGVjdFwiJytlLnRpdGxlKycgc3R5bGU9XCJwb3NpdGlvbjogcmVsYXRpdmVcIj48ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X19zZWxlY3QtdGV4dFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3RyaWdnZXJcIj48ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X190cmlnZ2VyLWFycm93XCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG5hLmNzcyh7bWFyZ2luOjAscGFkZGluZzowfSkuYWZ0ZXIoZykucHJlcGVuZFRvKGcpO3ZhciBMPWIoXCJkaXYuanEtc2VsZWN0Ym94X19zZWxlY3RcIixnKSxyPWIoXCJkaXYuanEtc2VsZWN0Ym94X19zZWxlY3QtdGV4dFwiLGcpLGU9bC5maWx0ZXIoXCI6c2VsZWN0ZWRcIik7ZCgpO2smJihzPSc8ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X19zZWFyY2hcIj48aW5wdXQgdHlwZT1cInNlYXJjaFwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIHBsYWNlaG9sZGVyPVwiJytwKydcIj48L2Rpdj48ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X19ub3QtZm91bmRcIj4nK3UrXCI8L2Rpdj5cIik7dmFyIG09YignPGRpdiBjbGFzcz1cImpxLXNlbGVjdGJveF9fZHJvcGRvd25cIiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZVwiPicrcysnPHVsIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBsaXN0LXN0eWxlOiBub25lOyBvdmVyZmxvdzogYXV0bzsgb3ZlcmZsb3cteDogaGlkZGVuXCI+Jyt0K1wiPC91bD48L2Rpdj5cIik7Zy5hcHBlbmQobSk7XG52YXIgcT1iKFwidWxcIixtKSxuPWIoXCJsaVwiLG0pLEU9YihcImlucHV0XCIsbSksQT1iKFwiZGl2LmpxLXNlbGVjdGJveF9fbm90LWZvdW5kXCIsbSkuaGlkZSgpO24ubGVuZ3RoPGgmJkUucGFyZW50KCkuaGlkZSgpO1wiXCI9PT1hLnZhbCgpP3IudGV4dChIKS5hZGRDbGFzcyhcInBsYWNlaG9sZGVyXCIpOnIudGV4dChlLnRleHQoKSk7dmFyIEY9MCxCPTA7bi5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9Yih0aGlzKTthLmNzcyh7ZGlzcGxheTpcImlubGluZS1ibG9ja1wifSk7YS5pbm5lcldpZHRoKCk+RiYmKEY9YS5pbm5lcldpZHRoKCksQj1hLndpZHRoKCkpO2EuY3NzKHtkaXNwbGF5OlwiXCJ9KX0pO3IuaXMoXCIucGxhY2Vob2xkZXJcIikmJnIud2lkdGgoKT5GP3Iud2lkdGgoci53aWR0aCgpKToocz1nLmNsb25lKCkuYXBwZW5kVG8oXCJib2R5XCIpLndpZHRoKFwiYXV0b1wiKSxrPXMub3V0ZXJXaWR0aCgpLHMucmVtb3ZlKCksaz09Zy5vdXRlcldpZHRoKCkmJnIud2lkdGgoQikpO0Y+Zy53aWR0aCgpJiZtLndpZHRoKEYpO1xuXCJcIj09PWwuZmlyc3QoKS50ZXh0KCkmJlwiXCIhPT1hLmRhdGEoXCJwbGFjZWhvbGRlclwiKSYmbi5maXJzdCgpLmhpZGUoKTthLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLGxlZnQ6MCx0b3A6MCx3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsb3BhY2l0eTowfSk7dmFyIEM9Zy5vdXRlckhlaWdodCgpLEk9RS5vdXRlckhlaWdodCgpLEo9cS5jc3MoXCJtYXgtaGVpZ2h0XCIpLHM9bi5maWx0ZXIoXCIuc2VsZWN0ZWRcIik7MT5zLmxlbmd0aCYmbi5maXJzdCgpLmFkZENsYXNzKFwic2VsZWN0ZWQgc2VsXCIpO3ZvaWQgMD09PW4uZGF0YShcImxpLWhlaWdodFwiKSYmbi5kYXRhKFwibGktaGVpZ2h0XCIsbi5vdXRlckhlaWdodCgpKTt2YXIgRD1tLmNzcyhcInRvcFwiKTtcImF1dG9cIj09bS5jc3MoXCJsZWZ0XCIpJiZtLmNzcyh7bGVmdDowfSk7XCJhdXRvXCI9PW0uY3NzKFwidG9wXCIpJiZtLmNzcyh7dG9wOkN9KTttLmhpZGUoKTtzLmxlbmd0aCYmKGwuZmlyc3QoKS50ZXh0KCkhPWUudGV4dCgpJiZnLmFkZENsYXNzKFwiY2hhbmdlZFwiKSxcbmcuZGF0YShcImpxZnMtY2xhc3NcIixzLmRhdGEoXCJqcWZzLWNsYXNzXCIpKSxnLmFkZENsYXNzKHMuZGF0YShcImpxZnMtY2xhc3NcIikpKTtpZihhLmlzKFwiOmRpc2FibGVkXCIpKXJldHVybiBnLmFkZENsYXNzKFwiZGlzYWJsZWRcIiksITE7TC5jbGljayhmdW5jdGlvbigpe2IoXCJkaXYuanEtc2VsZWN0Ym94XCIpLmZpbHRlcihcIi5vcGVuZWRcIikubGVuZ3RoJiZmLm9uU2VsZWN0Q2xvc2VkLmNhbGwoYihcImRpdi5qcS1zZWxlY3Rib3hcIikuZmlsdGVyKFwiLm9wZW5lZFwiKSk7YS5mb2N1cygpO2lmKCF5KXt2YXIgYz1iKHdpbmRvdyksZD1uLmRhdGEoXCJsaS1oZWlnaHRcIiksZT1nLm9mZnNldCgpLnRvcCxrPWMuaGVpZ2h0KCktQy0oZS1jLnNjcm9sbFRvcCgpKSxwPWEuZGF0YShcInZpc2libGUtb3B0aW9uc1wiKTtpZih2b2lkIDA9PT1wfHxcIlwiPT09cClwPWYuc2VsZWN0VmlzaWJsZU9wdGlvbnM7dmFyIHM9NSpkLGg9ZCpwOzA8cCYmNj5wJiYocz1oKTswPT09cCYmKGg9XCJhdXRvXCIpO3ZhciBwPWZ1bmN0aW9uKCl7bS5oZWlnaHQoXCJhdXRvXCIpLmNzcyh7Ym90dG9tOlwiYXV0b1wiLFxudG9wOkR9KTt2YXIgYT1mdW5jdGlvbigpe3EuY3NzKFwibWF4LWhlaWdodFwiLE1hdGguZmxvb3IoKGstMjAtSSkvZCkqZCl9O2EoKTtxLmNzcyhcIm1heC1oZWlnaHRcIixoKTtcIm5vbmVcIiE9SiYmcS5jc3MoXCJtYXgtaGVpZ2h0XCIsSik7azxtLm91dGVySGVpZ2h0KCkrMjAmJmEoKX0scj1mdW5jdGlvbigpe20uaGVpZ2h0KFwiYXV0b1wiKS5jc3Moe3RvcDpcImF1dG9cIixib3R0b206RH0pO3ZhciBhPWZ1bmN0aW9uKCl7cS5jc3MoXCJtYXgtaGVpZ2h0XCIsTWF0aC5mbG9vcigoZS1jLnNjcm9sbFRvcCgpLTIwLUkpL2QpKmQpfTthKCk7cS5jc3MoXCJtYXgtaGVpZ2h0XCIsaCk7XCJub25lXCIhPUomJnEuY3NzKFwibWF4LWhlaWdodFwiLEopO2UtYy5zY3JvbGxUb3AoKS0yMDxtLm91dGVySGVpZ2h0KCkrMjAmJmEoKX07ITA9PT13fHwxPT09dz9rPnMrSSsyMD8ocCgpLGcucmVtb3ZlQ2xhc3MoXCJkcm9wdXBcIikuYWRkQ2xhc3MoXCJkcm9wZG93blwiKSk6KHIoKSxnLnJlbW92ZUNsYXNzKFwiZHJvcGRvd25cIikuYWRkQ2xhc3MoXCJkcm9wdXBcIikpOlxuKCExPT09d3x8MD09PXcpJiZrPnMrSSsyMCYmKHAoKSxnLnJlbW92ZUNsYXNzKFwiZHJvcHVwXCIpLmFkZENsYXNzKFwiZHJvcGRvd25cIikpO2cub2Zmc2V0KCkubGVmdCttLm91dGVyV2lkdGgoKT5jLndpZHRoKCkmJm0uY3NzKHtsZWZ0OlwiYXV0b1wiLHJpZ2h0OjB9KTtiKFwiZGl2Lmpxc2VsZWN0XCIpLmNzcyh7ekluZGV4OnYtMX0pLnJlbW92ZUNsYXNzKFwib3BlbmVkXCIpO2cuY3NzKHt6SW5kZXg6dn0pO20uaXMoXCI6aGlkZGVuXCIpPyhiKFwiZGl2LmpxLXNlbGVjdGJveF9fZHJvcGRvd246dmlzaWJsZVwiKS5oaWRlKCksbS5zaG93KCksZy5hZGRDbGFzcyhcIm9wZW5lZCBmb2N1c2VkXCIpLGYub25TZWxlY3RPcGVuZWQuY2FsbChnKSk6KG0uaGlkZSgpLGcucmVtb3ZlQ2xhc3MoXCJvcGVuZWQgZHJvcHVwIGRyb3Bkb3duXCIpLGIoXCJkaXYuanEtc2VsZWN0Ym94XCIpLmZpbHRlcihcIi5vcGVuZWRcIikubGVuZ3RoJiZmLm9uU2VsZWN0Q2xvc2VkLmNhbGwoZykpO0UubGVuZ3RoJiYoRS52YWwoXCJcIikua2V5dXAoKSxcbkEuaGlkZSgpLEUua2V5dXAoZnVuY3Rpb24oKXt2YXIgYz1iKHRoaXMpLnZhbCgpO24uZWFjaChmdW5jdGlvbigpe2IodGhpcykuaHRtbCgpLm1hdGNoKFJlZ0V4cChcIi4qP1wiK2MrXCIuKj9cIixcImlcIikpP2IodGhpcykuc2hvdygpOmIodGhpcykuaGlkZSgpfSk7XCJcIj09PWwuZmlyc3QoKS50ZXh0KCkmJlwiXCIhPT1hLmRhdGEoXCJwbGFjZWhvbGRlclwiKSYmbi5maXJzdCgpLmhpZGUoKTsxPm4uZmlsdGVyKFwiOnZpc2libGVcIikubGVuZ3RoP0Euc2hvdygpOkEuaGlkZSgpfSkpO24uZmlsdGVyKFwiLnNlbGVjdGVkXCIpLmxlbmd0aCYmKFwiXCI9PT1hLnZhbCgpP3Euc2Nyb2xsVG9wKDApOigwIT09cS5pbm5lckhlaWdodCgpL2QlMiYmKGQvPTIpLHEuc2Nyb2xsVG9wKHEuc2Nyb2xsVG9wKCkrbi5maWx0ZXIoXCIuc2VsZWN0ZWRcIikucG9zaXRpb24oKS50b3AtcS5pbm5lckhlaWdodCgpLzIrZCkpKTt4KHEpfX0pO24uaG92ZXIoZnVuY3Rpb24oKXtiKHRoaXMpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKX0pO1xubi5maWx0ZXIoXCIuc2VsZWN0ZWRcIikudGV4dCgpO24uZmlsdGVyKFwiOm5vdCguZGlzYWJsZWQpOm5vdCgub3B0Z3JvdXApXCIpLmNsaWNrKGZ1bmN0aW9uKCl7YS5mb2N1cygpO3ZhciBjPWIodGhpcyksZD1jLnRleHQoKTtpZighYy5pcyhcIi5zZWxlY3RlZFwiKSl7dmFyIGU9Yy5pbmRleCgpLGU9ZS1jLnByZXZBbGwoXCIub3B0Z3JvdXBcIikubGVuZ3RoO2MuYWRkQ2xhc3MoXCJzZWxlY3RlZCBzZWxcIikuc2libGluZ3MoKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkIHNlbFwiKTtsLnByb3AoXCJzZWxlY3RlZFwiLCExKS5lcShlKS5wcm9wKFwic2VsZWN0ZWRcIiwhMCk7ci50ZXh0KGQpO2cuZGF0YShcImpxZnMtY2xhc3NcIikmJmcucmVtb3ZlQ2xhc3MoZy5kYXRhKFwianFmcy1jbGFzc1wiKSk7Zy5kYXRhKFwianFmcy1jbGFzc1wiLGMuZGF0YShcImpxZnMtY2xhc3NcIikpO2cuYWRkQ2xhc3MoYy5kYXRhKFwianFmcy1jbGFzc1wiKSk7YS5jaGFuZ2UoKX1tLmhpZGUoKTtnLnJlbW92ZUNsYXNzKFwib3BlbmVkIGRyb3B1cCBkcm9wZG93blwiKTtcbmYub25TZWxlY3RDbG9zZWQuY2FsbChnKX0pO20ubW91c2VvdXQoZnVuY3Rpb24oKXtiKFwibGkuc2VsXCIsbSkuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKX0pO2Eub24oXCJjaGFuZ2Uuc3R5bGVyXCIsZnVuY3Rpb24oKXtyLnRleHQobC5maWx0ZXIoXCI6c2VsZWN0ZWRcIikudGV4dCgpKS5yZW1vdmVDbGFzcyhcInBsYWNlaG9sZGVyXCIpO24ucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZCBzZWxcIikubm90KFwiLm9wdGdyb3VwXCIpLmVxKGFbMF0uc2VsZWN0ZWRJbmRleCkuYWRkQ2xhc3MoXCJzZWxlY3RlZCBzZWxcIik7bC5maXJzdCgpLnRleHQoKSE9bi5maWx0ZXIoXCIuc2VsZWN0ZWRcIikudGV4dCgpP2cuYWRkQ2xhc3MoXCJjaGFuZ2VkXCIpOmcucmVtb3ZlQ2xhc3MoXCJjaGFuZ2VkXCIpfSkub24oXCJmb2N1cy5zdHlsZXJcIixmdW5jdGlvbigpe2cuYWRkQ2xhc3MoXCJmb2N1c2VkXCIpO2IoXCJkaXYuanFzZWxlY3RcIikubm90KFwiLmZvY3VzZWRcIikucmVtb3ZlQ2xhc3MoXCJvcGVuZWQgZHJvcHVwIGRyb3Bkb3duXCIpLmZpbmQoXCJkaXYuanEtc2VsZWN0Ym94X19kcm9wZG93blwiKS5oaWRlKCl9KS5vbihcImJsdXIuc3R5bGVyXCIsXG5mdW5jdGlvbigpe2cucmVtb3ZlQ2xhc3MoXCJmb2N1c2VkXCIpfSkub24oXCJrZXlkb3duLnN0eWxlciBrZXl1cC5zdHlsZXJcIixmdW5jdGlvbihiKXt2YXIgYz1uLmRhdGEoXCJsaS1oZWlnaHRcIik7XCJcIj09PWEudmFsKCk/ci50ZXh0KEgpLmFkZENsYXNzKFwicGxhY2Vob2xkZXJcIik6ci50ZXh0KGwuZmlsdGVyKFwiOnNlbGVjdGVkXCIpLnRleHQoKSk7bi5yZW1vdmVDbGFzcyhcInNlbGVjdGVkIHNlbFwiKS5ub3QoXCIub3B0Z3JvdXBcIikuZXEoYVswXS5zZWxlY3RlZEluZGV4KS5hZGRDbGFzcyhcInNlbGVjdGVkIHNlbFwiKTtpZigzOD09Yi53aGljaHx8Mzc9PWIud2hpY2h8fDMzPT1iLndoaWNofHwzNj09Yi53aGljaClcIlwiPT09YS52YWwoKT9xLnNjcm9sbFRvcCgwKTpxLnNjcm9sbFRvcChxLnNjcm9sbFRvcCgpK24uZmlsdGVyKFwiLnNlbGVjdGVkXCIpLnBvc2l0aW9uKCkudG9wKTs0MCE9Yi53aGljaCYmMzkhPWIud2hpY2gmJjM0IT1iLndoaWNoJiYzNSE9Yi53aGljaHx8cS5zY3JvbGxUb3AocS5zY3JvbGxUb3AoKStcbm4uZmlsdGVyKFwiLnNlbGVjdGVkXCIpLnBvc2l0aW9uKCkudG9wLXEuaW5uZXJIZWlnaHQoKStjKTsxMz09Yi53aGljaCYmKGIucHJldmVudERlZmF1bHQoKSxtLmhpZGUoKSxnLnJlbW92ZUNsYXNzKFwib3BlbmVkIGRyb3B1cCBkcm9wZG93blwiKSxmLm9uU2VsZWN0Q2xvc2VkLmNhbGwoZykpfSkub24oXCJrZXlkb3duLnN0eWxlclwiLGZ1bmN0aW9uKGEpezMyPT1hLndoaWNoJiYoYS5wcmV2ZW50RGVmYXVsdCgpLEwuY2xpY2soKSl9KTtHLnJlZ2lzdGVyZWR8fChiKGRvY3VtZW50KS5vbihcImNsaWNrXCIsRyksRy5yZWdpc3RlcmVkPSEwKX1mdW5jdGlvbiBlKCl7dmFyIGU9bmV3IGMsZj1iKFwiPGRpdlwiK2UuaWQrJyBjbGFzcz1cImpxLXNlbGVjdC1tdWx0aXBsZSBqcXNlbGVjdCcrZS5jbGFzc2VzKydcIicrZS50aXRsZSsnIHN0eWxlPVwiZGlzcGxheTogaW5saW5lLWJsb2NrOyBwb3NpdGlvbjogcmVsYXRpdmVcIj48L2Rpdj4nKTthLmNzcyh7bWFyZ2luOjAscGFkZGluZzowfSkuYWZ0ZXIoZik7XG5kKCk7Zi5hcHBlbmQoXCI8dWw+XCIrdCtcIjwvdWw+XCIpO3ZhciBoPWIoXCJ1bFwiLGYpLmNzcyh7cG9zaXRpb246XCJyZWxhdGl2ZVwiLFwib3ZlcmZsb3cteFwiOlwiaGlkZGVuXCIsXCItd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZ1wiOlwidG91Y2hcIn0pLGs9YihcImxpXCIsZikuYXR0cihcInVuc2VsZWN0YWJsZVwiLFwib25cIiksZT1hLmF0dHIoXCJzaXplXCIpLHk9aC5vdXRlckhlaWdodCgpLHU9ay5vdXRlckhlaWdodCgpO3ZvaWQgMCE9PWUmJjA8ZT9oLmNzcyh7aGVpZ2h0OnUqZX0pOmguY3NzKHtoZWlnaHQ6NCp1fSk7eT5mLmhlaWdodCgpJiYoaC5jc3MoXCJvdmVyZmxvd1lcIixcInNjcm9sbFwiKSx4KGgpLGsuZmlsdGVyKFwiLnNlbGVjdGVkXCIpLmxlbmd0aCYmaC5zY3JvbGxUb3AoaC5zY3JvbGxUb3AoKStrLmZpbHRlcihcIi5zZWxlY3RlZFwiKS5wb3NpdGlvbigpLnRvcCkpO2EucHJlcGVuZFRvKGYpLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLGxlZnQ6MCx0b3A6MCx3aWR0aDpcIjEwMCVcIixoZWlnaHQ6XCIxMDAlXCIsXG5vcGFjaXR5OjB9KTtpZihhLmlzKFwiOmRpc2FibGVkXCIpKWYuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKSxsLmVhY2goZnVuY3Rpb24oKXtiKHRoaXMpLmlzKFwiOnNlbGVjdGVkXCIpJiZrLmVxKGIodGhpcykuaW5kZXgoKSkuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKX0pO2Vsc2UgaWYoay5maWx0ZXIoXCI6bm90KC5kaXNhYmxlZCk6bm90KC5vcHRncm91cClcIikuY2xpY2soZnVuY3Rpb24oYyl7YS5mb2N1cygpO3ZhciBkPWIodGhpcyk7Yy5jdHJsS2V5fHxjLm1ldGFLZXl8fGQuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtjLnNoaWZ0S2V5fHxkLmFkZENsYXNzKFwiZmlyc3RcIik7Yy5jdHJsS2V5fHwoYy5tZXRhS2V5fHxjLnNoaWZ0S2V5KXx8ZC5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWQgZmlyc3RcIik7aWYoYy5jdHJsS2V5fHxjLm1ldGFLZXkpZC5pcyhcIi5zZWxlY3RlZFwiKT9kLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWQgZmlyc3RcIik6ZC5hZGRDbGFzcyhcInNlbGVjdGVkIGZpcnN0XCIpLGQuc2libGluZ3MoKS5yZW1vdmVDbGFzcyhcImZpcnN0XCIpO1xuaWYoYy5zaGlmdEtleSl7dmFyIGU9ITEsZj0hMTtkLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKS5zaWJsaW5ncyhcIi5maXJzdFwiKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO2QucHJldkFsbCgpLmVhY2goZnVuY3Rpb24oKXtiKHRoaXMpLmlzKFwiLmZpcnN0XCIpJiYoZT0hMCl9KTtkLm5leHRBbGwoKS5lYWNoKGZ1bmN0aW9uKCl7Yih0aGlzKS5pcyhcIi5maXJzdFwiKSYmKGY9ITApfSk7ZSYmZC5wcmV2QWxsKCkuZWFjaChmdW5jdGlvbigpe2lmKGIodGhpcykuaXMoXCIuc2VsZWN0ZWRcIikpcmV0dXJuITE7Yih0aGlzKS5ub3QoXCIuZGlzYWJsZWQsIC5vcHRncm91cFwiKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpfSk7ZiYmZC5uZXh0QWxsKCkuZWFjaChmdW5jdGlvbigpe2lmKGIodGhpcykuaXMoXCIuc2VsZWN0ZWRcIikpcmV0dXJuITE7Yih0aGlzKS5ub3QoXCIuZGlzYWJsZWQsIC5vcHRncm91cFwiKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpfSk7MT09ay5maWx0ZXIoXCIuc2VsZWN0ZWRcIikubGVuZ3RoJiZcbmQuYWRkQ2xhc3MoXCJmaXJzdFwiKX1sLnByb3AoXCJzZWxlY3RlZFwiLCExKTtrLmZpbHRlcihcIi5zZWxlY3RlZFwiKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9Yih0aGlzKSxjPWEuaW5kZXgoKTthLmlzKFwiLm9wdGlvblwiKSYmKGMtPWEucHJldkFsbChcIi5vcHRncm91cFwiKS5sZW5ndGgpO2wuZXEoYykucHJvcChcInNlbGVjdGVkXCIsITApfSk7YS5jaGFuZ2UoKX0pLGwuZWFjaChmdW5jdGlvbihhKXtiKHRoaXMpLmRhdGEoXCJvcHRpb25JbmRleFwiLGEpfSksYS5vbihcImNoYW5nZS5zdHlsZXJcIixmdW5jdGlvbigpe2sucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTt2YXIgYT1bXTtsLmZpbHRlcihcIjpzZWxlY3RlZFwiKS5lYWNoKGZ1bmN0aW9uKCl7YS5wdXNoKGIodGhpcykuZGF0YShcIm9wdGlvbkluZGV4XCIpKX0pO2subm90KFwiLm9wdGdyb3VwXCIpLmZpbHRlcihmdW5jdGlvbihjKXtyZXR1cm4tMTxiLmluQXJyYXkoYyxhKX0pLmFkZENsYXNzKFwic2VsZWN0ZWRcIil9KS5vbihcImZvY3VzLnN0eWxlclwiLGZ1bmN0aW9uKCl7Zi5hZGRDbGFzcyhcImZvY3VzZWRcIil9KS5vbihcImJsdXIuc3R5bGVyXCIsXG5mdW5jdGlvbigpe2YucmVtb3ZlQ2xhc3MoXCJmb2N1c2VkXCIpfSkseT5mLmhlaWdodCgpKWEub24oXCJrZXlkb3duLnN0eWxlclwiLGZ1bmN0aW9uKGEpezM4IT1hLndoaWNoJiYzNyE9YS53aGljaCYmMzMhPWEud2hpY2h8fGguc2Nyb2xsVG9wKGguc2Nyb2xsVG9wKCkray5maWx0ZXIoXCIuc2VsZWN0ZWRcIikucG9zaXRpb24oKS50b3AtdSk7NDAhPWEud2hpY2gmJjM5IT1hLndoaWNoJiYzNCE9YS53aGljaHx8aC5zY3JvbGxUb3AoaC5zY3JvbGxUb3AoKStrLmZpbHRlcihcIi5zZWxlY3RlZDpsYXN0XCIpLnBvc2l0aW9uKCkudG9wLWguaW5uZXJIZWlnaHQoKSsyKnUpfSl9dmFyIGw9YihcIm9wdGlvblwiLGEpLHQ9XCJcIjthLmlzKFwiW211bHRpcGxlXVwiKT9ofHx5fHxlKCk6eigpfTtNKCk7YS5vbihcInJlZnJlc2hcIixmdW5jdGlvbigpe2Eub2ZmKFwiLnN0eWxlclwiKS5wYXJlbnQoKS5iZWZvcmUoYSkucmVtb3ZlKCk7TSgpfSl9ZWxzZSBpZihhLmlzKFwiOnJlc2V0XCIpKWEub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2EuY2xvc2VzdChmLndyYXBwZXIpLmZpbmQoXCJpbnB1dCwgc2VsZWN0XCIpLnRyaWdnZXIoXCJyZWZyZXNoXCIpfSxcbjEpfSl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt2YXIgYz1iKHRoaXMuZWxlbWVudCk7Yy5pcyhcIjpjaGVja2JveFwiKXx8Yy5pcyhcIjpyYWRpb1wiKT8oYy5yZW1vdmVEYXRhKFwiX1wiK2gpLm9mZihcIi5zdHlsZXIgcmVmcmVzaFwiKS5yZW1vdmVBdHRyKFwic3R5bGVcIikucGFyZW50KCkuYmVmb3JlKGMpLnJlbW92ZSgpLGMuY2xvc2VzdChcImxhYmVsXCIpLmFkZCgnbGFiZWxbZm9yPVwiJytjLmF0dHIoXCJpZFwiKSsnXCJdJykub2ZmKFwiLnN0eWxlclwiKSk6Yy5pcygnaW5wdXRbdHlwZT1cIm51bWJlclwiXScpP2MucmVtb3ZlRGF0YShcIl9cIitoKS5vZmYoXCIuc3R5bGVyIHJlZnJlc2hcIikuY2xvc2VzdChcIi5qcS1udW1iZXJcIikuYmVmb3JlKGMpLnJlbW92ZSgpOihjLmlzKFwiOmZpbGVcIil8fGMuaXMoXCJzZWxlY3RcIikpJiZjLnJlbW92ZURhdGEoXCJfXCIraCkub2ZmKFwiLnN0eWxlciByZWZyZXNoXCIpLnJlbW92ZUF0dHIoXCJzdHlsZVwiKS5wYXJlbnQoKS5iZWZvcmUoYykucmVtb3ZlKCl9fTtiLmZuW2hdPWZ1bmN0aW9uKGMpe3ZhciBhPVxuYXJndW1lbnRzO2lmKHZvaWQgMD09PWN8fFwib2JqZWN0XCI9PT10eXBlb2YgYylyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7Yi5kYXRhKHRoaXMsXCJfXCIraCl8fGIuZGF0YSh0aGlzLFwiX1wiK2gsbmV3IHoodGhpcyxjKSl9KS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpe3ZhciBhPWIodGhpc1swXSkuZGF0YShcIl9cIitoKTthJiZhLm9wdGlvbnMub25Gb3JtU3R5bGVkLmNhbGwoKX0pLHRoaXM7aWYoXCJzdHJpbmdcIj09PXR5cGVvZiBjJiZcIl9cIiE9PWNbMF0mJlwiaW5pdFwiIT09Yyl7dmFyIGY7dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIHk9Yi5kYXRhKHRoaXMsXCJfXCIraCk7eSBpbnN0YW5jZW9mIHomJlwiZnVuY3Rpb25cIj09PXR5cGVvZiB5W2NdJiYoZj15W2NdLmFwcGx5KHksQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYSwxKSkpfSk7cmV0dXJuIHZvaWQgMCE9PWY/Zjp0aGlzfX07Ry5yZWdpc3RlcmVkPSExfSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
