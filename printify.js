window.printify = function() {
	var dimensions = {};

	var noop = function() {};
	var until = function(list, fn) {
		for (var i = 0; i < list.length; i++) {
			if (fn(list[i])) return true;
		}
		return false;
	};

	var pixels = function(cm) {
		if (typeof cm === 'number') return cm;
		if (dimensions[cm]) return dimensions[cm];
		var $dim = $('<div style="top:-10000px;left:-10000px;position:absolute;width:'+cm+';height:1px;"></div>').appendTo('body');
		dimensions[cm] = $dim.width();
		$dim.remove();
		return dimensions[cm];
	};

	return function(content, options) {
		var nextPage = 0;
		var nextBreak = 0;

		options = options || {};

		var overload = function(val) {
			if (!val) return noop;
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

		$.each(['left', 'right', 'top', 'bottom'], function(i, key) {
			options[key] = overload(options[key]);
		});

		var pageHeight = pixels(options.pageHeight || '29.7cm');
		var pageWidth = pixels(options.pageWidth || '21cm');
		var spacing = options.spacing || 0;
		var onbeforebreak = options.beforeBreak || noop;
		var onafterbreak = options.afterBreak || noop;

		if (options.landscape) {
			var tmp = pageHeight;
			pageHeight = pageWidth
			pageWidth = tmp;
		}

		var $content = $(content);
		$content.width(pageWidth);
		$content.css('position', 'absolute');

		var contentOffset = $content.offset().top;
		var boxHeight = pageHeight + spacing;

		var update = function() {
			var $prev;
			return until(Array.prototype.slice.apply($content.find('.page-break:not(.page-break-visited)')), function(el) {
				var $el = $(el);
				if ($el.offset().top - contentOffset > nextBreak && $prev) {
					onbeforebreak($prev, nextPage);

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
						width:pageWidth-$right.width()-$left.width(),
					});

					$left.add($right).css({
						top:pageTop + spacing,
						height:pageTopNext - pageTop - spacing
					});

					$top.css({top:pageTop + spacing});
					$bottom.css({top:pageTopNext - $bottom.height()});

					$content.css({
						marginLeft:$left.width(),
						width:pageWidth-$left.width()-$right.width()
					});

					var breakHeight = spacing + $top.height() + pageTop - ($prev.offset().top - contentOffset);
					$prev.height(breakHeight).addClass('page-actual-break');

					if ($prev.prev().hasClass('page-break') && !$prev.prev().hasClass('page-actual-break')) {
						$prev.prev().height(breakHeight - $top.height()).addClass('page-actual-break');
						$prev.height($top.height());
					}

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

					onafterbreak($prev, nextPage);

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

		$content.find('.page-frame').remove();
		$content.find('.page-bottom, .page-top, .page-left, .page-right').remove();
		$content.find('.page-actual-break').removeClass('page-actual-break').height(0);
		$content.find('.page-break-visited').removeClass('page-break-visited');

		while (update());

		$content.height(boxHeight * nextPage+spacing);

		return {
			pageWidth: pageWidth,
			pageHeight: pageHeight,
			width: pageWidth,
			height: $content.height(),
			pages: nextPage,
			render: function() {
				return printify(content, options);
			}
		};
	};
}();
