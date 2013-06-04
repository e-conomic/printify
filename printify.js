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

		var overload = function(val) {
			if (typeof val === 'number') {
				return function() {
					return '<div style="width:'+val+'px; height:'+val+'px;"></div>';
				};
			}
			if (typeof val === 'string') {
				return function() {
					return val;
				};
			}
			if (typeof val === 'object' && typeof val.html === 'function') {
				return function() {
					return val.html();
				};
			}
			return val;
		};

		['left', 'right', 'top', 'bottom'].forEach(function(key) {
			options[key] = overload(options[key]);
		});

		var pageHeight = options.pageHeight || A4_PAGE_HEIGHT;
		var pageWidth = options.pageWidth || A4_PAGE_WIDTH;
		var spacing = options.spacing || 0;

		var $content = $(content);
		$content.width(pageWidth);
		$content.css('position', 'absolute');

		var contentOffset = $content.offset().top;
		var boxHeight = pageHeight + spacing;

		var update = function() {
			var $prev;
			return Array.prototype.slice.apply($('.page-break:not(.page-break-visited)')).some(function(el) {
				var $el = $(el);
				if ($el.offset().top - contentOffset > nextBreak && $prev) {
					var $top = $('<div class="page-top">'+(options.top(nextPage) || '')+'</div>').appendTo($content);
					var $bottom = $('<div class="page-bottom">'+(options.bottom(nextPage) || '')+'</div>').appendTo($content);
					var $left = $('<div class="page-left">'+(options.left(nextPage) || '')+'</div>').appendTo($content);
					var $right = $('<div class="page-right">'+(options.right(nextPage) || '')+'</div>').appendTo($content);

					var pageTop = nextPage * boxHeight;
					var pageTopNext = (nextPage + 1) * boxHeight;

					$left.add($right).css({position:'absolute'});

					$left.css({left:-$left.width()});
					$right.css({right:-$right.width()});

					$top.add($bottom).css({
						position:'absolute',
						width:pageWidth,
						left:-$left.width()
					});

					$top.css({top:pageTop + spacing});
					$bottom.css({top:pageTopNext - $bottom.height()});

					$left.add($right).css({
						top:pageTop + $top.height() + spacing,
						height:pageTopNext - $bottom.height() - (pageTop + $top.height())
					});

					$content.css({
						marginLeft:$left.width(),
						width:pageWidth-$left.width()-$right.width()
					});

					var breakHeight = spacing + $top.height() + pageTop - ($prev.offset().top - contentOffset);
					$prev.height(breakHeight).addClass('page-actual-break');
					$el.removeClass('page-break-visited');

					if (options.frame) {
						var $frame = $('<div></div>');
						$frame.addClass('page-frame').css({
							position:'absolute',
							zIndex:-1,
							top:pageTop+spacing,
							left:-$left.width(),
							width:pageWidth,
							height:pageHeight
						});
						$frame.appendTo($content);
					}

					nextPage++;
					nextBreak = pageTopNext - $bottom.height();

					return true;
				}
				$el.addClass('page-break-visited');
				$prev = $el;
			});
		};

		if (!$content.children().first().hasClass('page-break-first')) {
			$content.prepend('<div class="page-break page-break-first"></div>');
		}
		if (!$content.children().last().hasClass('page-break-last')) {
			$content.append('<div class="page-break page-break-last"></div>');
		}

		$content.find('.page-bottom, .page-top, .page-left, .page-right').remove();
		$content.find('.page-actual-break').removeClass('page-actual-break').height(0);
		$content.find('.page-break-visited').removeClass('page-break-visited').removeClass('.page-actual-break');

		while (update());

		$content.height(boxHeight * nextPage+spacing);

		return {
			pageWidth: pageWidth,
			pageHeight: pageHeight,
			width: pageWidth,
			height: $content.height(),
			pages: nextPage
		};
	};
}();
