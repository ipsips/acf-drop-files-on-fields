'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = jQuery;

var ACFDropFilesOnFields = function () {
  function ACFDropFilesOnFields(enabledTypes, options) {
    var _this2 = this;

    _classCallCheck(this, ACFDropFilesOnFields);

    this.init = function () {
      var selector = _this2.enabledTypes.map(function (type) {
        return '.acf-field-' + type;
      }).join(', ');
      var $fields = $(selector);

      if ($fields.length) {
        if (!!_this2.options.disableEditorAsDropTarget) _this2.disableEditorAsDropTarget();

        $fields.each(_this2.addUploader);
      }
    };

    this.addUploader = function (idx, field) {
      var _this = _this2;
      var fieldType = $(field).data('type');
      var uploader = wp.media.view.EditorUploader.extend({
        className: 'uploader-acf-field',
        initialize: function initialize() {
          var _this3 = this;

          this.initialized = window.tinyMCEPreInit && window.tinyMCEPreInit.dragDropUpload && this.browserSupport();

          if (this.initialized) {
            (function () {
              _this3.dropzones = [];
              _this3.files = [];

              $(field).on('drop', '.uploader-acf-field', _this3.drop.bind(_this3)).on('dragover', '.uploader-acf-field', _this3.dropzoneDragover.bind(_this3)).on('dragleave', '.uploader-acf-field', _this3.dropzoneDragleave.bind(_this3)).on('click', '.uploader-acf-field', _this3.click.bind(_this3));

              var __this = _this3;

              $(document).on('dragover', _this3.containerDragover.bind(_this3)).on('dragleave', _this3.containerDragleave.bind(_this3)).on('dragstart dragend drop', function (evt) {
                __this.localDrag = evt.type === 'dragstart';

                if (evt.type === 'drop') __this.containerDragleave();
              });
            })();
          }

          return this;
        },
        render: function render() {
          if (!this.initialized) return this;

          wp.media.View.prototype.render.apply(this, arguments);

          this.attach(0, field);

          return this;
        },
        drop: function drop(evt) {
          this.containerDragleave(evt);
          this.dropzoneDragleave(evt);

          if (!_this.isDescendant(evt, field)) return;

          this.files = evt.originalEvent.dataTransfer.files;

          if (this.files.length < 1) return;

          acf.fields._show_field($(evt.target).closest('.acf-field'));

          var addMethodName = ['add', '_add'].find(function (methodName) {
            return acf.fields[fieldType].hasOwnProperty(methodName);
          });

          if (addMethodName) {
            acf.fields[fieldType][addMethodName]();

            if (this.workflow) this.workflow.state().reset();

            this.workflow = acf.media.frames[0];

            if (this.workflow.uploader.uploader && this.workflow.uploader.uploader.ready) this.addFiles.apply(this);else this.workflow.on('uploader:ready', this.addFiles, this);
          }

          return false;
        },
        refresh: function refresh(evt) {
          var dropzone_id = void 0;

          for (dropzone_id in this.dropzones) {
            this.dropzones[dropzone_id].toggle(this.overContainer || this.overDropzone);
          }if (typeof evt !== 'undefined') $(evt.target).closest('.uploader-acf-field').toggleClass('droppable', this.overDropzone);

          if (!this.overContainer && !this.overDropzone) this.draggingFile = null;

          return this;
        }
      });

      _this2.uploaders[idx] = new uploader();
      _this2.uploaders[idx].render();
    };

    this.isDescendant = function (evt, parent) {
      var node = evt.target;

      while (node !== null) {
        if (node === parent) return true;

        node = node.parentNode;
      }

      return false;
    };

    this.enabledTypes = enabledTypes;
    this.options = _extends({
      disableEditorAsDropTarget: false
    }, options);
    this.uploaders = [];

    if ($.isReady) setTimeout(this.init);else $(document).ready(function () {
      return setTimeout(_this2.init);
    });
  }

  _createClass(ACFDropFilesOnFields, [{
    key: 'disableEditorAsDropTarget',
    value: function disableEditorAsDropTarget() {
      if ($('.wp-editor-wrap').length) {
        $(document).off('drop', '.uploader-editor');
        $(document).off('dragover', '.uploader-editor');
        $(document).off('dragleave', '.uploader-editor');
        $(document).off('click', '.uploader-editor');
        $(document).off('dragover');
        $(document).off('dragleave');
        $(document).off('dragstart dragend drop');
      }
    }
  }]);

  return ACFDropFilesOnFields;
}();

if (window.hasOwnProperty('acfDropFilesOnFields')) (function (_ref) {
  var enabledTypes = _ref.enabledTypes;
  var disableEditorAsDropTarget = _ref.disableEditorAsDropTarget;
  return new ACFDropFilesOnFields(enabledTypes, {
    disableEditorAsDropTarget: disableEditorAsDropTarget
  });
})(window.acfDropFilesOnFields);

$(document).ready(function () {
  if (!$('#acf-drop-files-on-fields').length) return;

  $('pre code').each(function () {
    var $code = $(this);

    var html = $code.html();
    var pattern = html.match(/\s*\n[\t\s]*/);

    $code.html(html.replace(new RegExp(pattern, 'g'), '\n').trim());

    $code.parent().height($code.outerHeight());
  });

  $('.code-block .expand-btn').on('click', function () {
    var $btn = $(this);

    var _$$data = $(this).data();

    var switchLabel = _$$data.switchLabel;


    $btn.data('switch-label', $btn.text()).text(switchLabel).parent().toggleClass('expanded');
  });
});
//# sourceMappingURL=acf-drop-files-on-fields.js.map
