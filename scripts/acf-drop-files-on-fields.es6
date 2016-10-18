const $ = jQuery

class ACFDropFilesOnFields {
  constructor(enabledTypes, options) {
    this.enabledTypes = enabledTypes
    this.options = Object.assign({
      disableEditorAsDropTarget: false
    }, options)
    this.uploaders = []

    if ($.isReady)
      setTimeout(this.init)
    else
      $(document).ready(() => setTimeout(this.init))
  }
  init = () => {
    const selector = this.enabledTypes
      .map(type => `.acf-field-${type}`)
      .join(', ')
    const $fields = $(selector)

    if ($fields.length) {
      if (!!this.options.disableEditorAsDropTarget)
        this.disableEditorAsDropTarget()

      $fields.each(this.addUploader)
    }
  }
  addUploader = (idx, field) => {
    const _this = this
    const fieldType = $(field).data('type')
    const uploader = wp.media.view.EditorUploader.extend({
      className: 'uploader-acf-field',
      initialize: function() {
        this.initialized =
          window.tinyMCEPreInit &&
          window.tinyMCEPreInit.dragDropUpload &&
          this.browserSupport()

        if (this.initialized) {
          this.dropzones = []
          this.files = []

          $(field)
            .on('drop', '.uploader-acf-field', this.drop.bind(this))
            .on('dragover', '.uploader-acf-field', this.dropzoneDragover.bind(this))
            .on('dragleave', '.uploader-acf-field', this.dropzoneDragleave.bind(this))
            .on('click', '.uploader-acf-field', this.click.bind(this))

          const __this = this

          $(document)
            .on('dragover', this.containerDragover.bind(this))
            .on('dragleave', this.containerDragleave.bind(this))
            .on('dragstart dragend drop', (evt) => {
              __this.localDrag = evt.type === 'dragstart'

              if (evt.type === 'drop')
                __this.containerDragleave()
            })
        }

        return this
      },
      render: function() {
        if (!this.initialized)
          return this

        wp.media.View.prototype.render.apply(this, arguments)
        
        this.attach(0, field)
        
        return this
      },
      drop: function(evt) {
        this.containerDragleave(evt)
        this.dropzoneDragleave(evt)

        if (!_this.isDescendant(evt, field))
          return

        this.files = evt.originalEvent.dataTransfer.files
        
        if (this.files.length < 1)
          return

        acf.fields._show_field($(evt.target).closest('.acf-field'))

        const addMethodName = ['add', '_add'].find(methodName =>
          acf.fields[fieldType].hasOwnProperty(methodName)
        )

        if (addMethodName) {
          acf.fields[fieldType][addMethodName]()

          if (this.workflow)
            this.workflow.state().reset()

          this.workflow = acf.media.frames[0]
          
          if (this.workflow.uploader.uploader && this.workflow.uploader.uploader.ready)
            this.addFiles.apply(this)
          else
            this.workflow.on('uploader:ready', this.addFiles, this)
        }

        return false
      },
      refresh: function(evt) {
        let dropzone_id
        
        for (dropzone_id in this.dropzones)
          this.dropzones[dropzone_id].toggle(this.overContainer || this.overDropzone)

        if (typeof evt !== 'undefined')
          $(evt.target)
            .closest('.uploader-acf-field')
            .toggleClass('droppable', this.overDropzone)

        if (!this.overContainer && !this.overDropzone)
          this.draggingFile = null

        return this
      }
    })

    this.uploaders[idx] = new uploader()
    this.uploaders[idx].render()
  }
  isDescendant = (evt, parent) => {
    let node = evt.target
    
    while (node !== null) {
      if (node === parent)
        return true
      
      node = node.parentNode
    }

    return false
  }
  disableEditorAsDropTarget() {
    if ($('.wp-editor-wrap').length) {
      $(document).off('drop', '.uploader-editor')
      $(document).off('dragover', '.uploader-editor')
      $(document).off('dragleave', '.uploader-editor')
      $(document).off('click', '.uploader-editor')
      $(document).off('dragover')
      $(document).off('dragleave')
      $(document).off('dragstart dragend drop')
    }
  }
}

if (window.hasOwnProperty('acfDropFilesOnFields'))
  (({ enabledTypes, disableEditorAsDropTarget }) =>
    new ACFDropFilesOnFields(
      enabledTypes, {
        disableEditorAsDropTarget
      })
  )(window.acfDropFilesOnFields)

/**
 * Options screen functionality
 */
$(document).ready(() => {
  if (!$('#acf-drop-files-on-fields').length)
    return

  $('pre code').each(function () {
    const $code = $(this)
    
    /**
     * Remove leading white-space from the code block.
     * @source http://stackoverflow.com/a/31754939/1364424
     */
    const html = $code.html()
    const pattern = html.match(/\s*\n[\t\s]*/)

    $code.html(html.replace(new RegExp(pattern, 'g'), '\n').trim())

    /* set height for proper exapand/collapse toggling */
    $code.parent().height($code.outerHeight())
  })

  $('.code-block .expand-btn').on('click', function () {
    const $btn = $(this)
    const { switchLabel } = $(this).data()

    $btn
      .data('switch-label', $btn.text())
      .text(switchLabel)
      .parent()
        .toggleClass('expanded')
  })
})