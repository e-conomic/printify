window.printify = function() {
	var A4_PAGE_HEIGHT;
	var A4_PAGE_WIDTH;

	var noop = function() {};

	return function(content, options) {
		var nextPage = 0;
		var nextBreak = 0;

		if (A4_PAGE_WIDTH === undefined) {
			var $dim = $('<div style="top:-10000px;left:-10000px;position:absolute;width:21cm;height:29.7cm;"></div>').appendTo('body');

			A4_PAGE_WIDTH = $dim.width();
			A4_PAGE_HEIGHT = $dim.height();

			$dim.remove();
		}

		options = options || {};
		options.bottom = options.bottom || noop;
		options.top = options.top || noop;
		options.left = options.left || noop;
		options.right = options.right || noop;

		['left', 'right', 'top', 'bottom'].forEach(function(key) {
			var val = options[key];
			if (typeof val === 'number') {
				options[key] = function() {
					return '<div style="width:'+val+'px; height:'+val+'px;"></div>';
				};
				return;
			}
			if (typeof val === 'string') {
				options[key] = function() {
					return val;
				};
				return;
			}
			if (typeof val === 'object' && typeof val.html === 'function') {
				options[key] = function() {
					return val.html();
				};
				return;
			}
		});

		var pageHeight = (options.page && options.page[1]) || A4_PAGE_HEIGHT;
		var pageWidth = (options.page && options.page[0]) || A4_PAGE_WIDTH;

		var $content = $(content);
		$content.width(pageWidth);
		$content.css('position', 'absolute');

		var update = function() {
			var prev;
			return Array.prototype.slice.apply($('.page-break:not(.broken)')).some(function(el) {
				if (el.offsetTop > nextBreak && prev) {
					var $top = $('<div class="page-top">'+(options.top(nextPage) || '')+'</div>').appendTo($content);
					var $bottom = $('<div class="page-bottom">'+(options.bottom(nextPage) || '')+'</div>').appendTo($content);
					var $left = $('<div class="page-left">'+(options.left(nextPage) || '')+'</div>').appendTo($content);
					var $right = $('<div class="page-right">'+(options.right(nextPage) || '')+'</div>').appendTo($content);

					var pageTop = nextPage * pageHeight;
					var pageTopNext = (nextPage + 1) * pageHeight;

					$left.add($right).css({position:'absolute', top:pageTop});

					$left.css({left:-$left.width()});
					$right.css({right:-$right.width()});

					$top.add($bottom).css({position:'absolute', width:pageWidth, left:-$left.width()});

					$top.css({top:pageTop});
					$bottom.css({top:pageTopNext - $bottom.height()});

					$left.add($right).css({top:pageTop+$top.height(), height:pageTopNext - $bottom.height() - (pageTop + $top.height())});

					$content.css({marginLeft:$left.width(), width:pageWidth-$left.width()-$right.width()});

					prev.style.height = ($top.height() + pageTop - prev.offsetTop)+'px';
					$(el).removeClass('broken');

					nextPage++;
					nextBreak = pageTopNext - $bottom.height();

					return true;
				}
				$(el).addClass('broken');
				prev = el;
			});
		};

		if (!$content.children().first().hasClass('page-break-first')) {
			$content.prepend('<div class="page-break page-break-first"></div>');
		}
		if (!$content.children().last().hasClass('page-break-last')) {
			$content.append('<div class="page-break page-break-last"></div>');
		}

		$content.find('.page-bottom, .page-top, .page-left, .page-right').remove();
		$content.find('.page-break').removeClass('broken');

		while (update());

		return {
			pageWidth: pageWidth,
			pageHeight: pageHeight,
			pages: nextPage,
			page: function(num) {
				num = num || 0;
				return $('<div></div>').css({
					overflow:'hidden',
					height: pageHeight,
					width: pageWidth,
					position: 'relative'
				}).append($content.clone().css('margin-top',-pageHeight*num));
			}
		};
	};
}();
