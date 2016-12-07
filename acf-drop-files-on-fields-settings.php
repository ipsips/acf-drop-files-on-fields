<?php

if (!defined('ABSPATH'))
  exit;

class ACF_Drop_Files_On_Fields_Settings {
  function __construct() {
    $this->options = get_option('acf_drop_files_on_fields_options', self::get_default_options());
    $this->title = __('Drop Files on Fields', 'acf-drop-files-on-fields');

    register_uninstall_hook(__FILE__, ['ACF_Drop_Files_On_Fields_Settings', 'on_uninstall']);
    add_action('admin_menu', [$this, 'add_admin_menu_item'], 99);
    add_action('admin_init', [$this, 'register_settings']);
    add_filter('plugin_action_links_acf-drop-files-on-fields/acf-drop-files-on-fields.php', [$this, 'add_plugin_action_links']);
  }

  static function on_uninstall() {
    delete_option('acf_drop_files_on_fields_options');
    delete_site_option('acf_drop_files_on_fields_options'); // multisite
  }

  function add_plugin_action_links($actions) {
    return array_merge([
      'settings' => sprintf(
        '<a href="%sedit.php?post_type=acf-field-group&page=acf_drop_files_on_fields_options">%s</a>',
        admin_url(),
        __('Settings', 'acf-drop-files-on-fields')
      )
    ], $actions);
  }

  function add_admin_menu_item() {
    add_submenu_page(
      'edit.php?post_type=acf-field-group', // parent slug
      $this->title,                         // page title in <head>
      $this->title,                         // menu title
      'manage_options',                     // capability
      'acf_drop_files_on_fields_options',   // menu slug
      [$this, 'render_options_page']        // render function
    );
  }
  
  function register_settings() {
    register_setting(
      'acf_drop_files_on_fields_options_group',
      'acf_drop_files_on_fields_options',
      [$this, 'sanitize']
    );
    add_settings_section(
      'acf_drop_files_on_fields_options_section',
      '',
      [$this, 'render_section_heading'],
      'acf_drop_files_on_fields_options_screen'
    );

    add_settings_field(
      'enabled_for',
      __('Enabled as drop target:', 'acf-drop-files-on-fields'),
      [$this, 'render_enabled_for_field'],
      'acf_drop_files_on_fields_options_screen',
      'acf_drop_files_on_fields_options_section', [
        /* $args */
        'name' => 'enabled_for'
      ]
    );
    add_settings_field(
      'disabled_for',
      __('Disabled as drop target:', 'acf-drop-files-on-fields'),
      [$this, 'render_disabled_for_field'],
      'acf_drop_files_on_fields_options_screen',
      'acf_drop_files_on_fields_options_section', [
        /* $args */
        'name' => 'disabled_for'
      ]
    );
  }

  function render_options_page() {
    ?>
      <div id="acf-drop-files-on-fields" class="wrap wrap acf-settings-wrap">
        <h2><?php echo $this->title ?></h2>
        <!-- Options block -->
        <div class="acf-box" id="acf-drop-files-on-fields-options">
          <div class="title">
            <h3><?php _e('Options', 'acf-drop-files-on-fields') ?></h3>
          </div>
          <div class="inner">
            <form method="post" action="options.php" id="acf_drop_files_on_fields-options-form">
              <?php
                /* This prints out all hidden setting fields */
                settings_fields('acf_drop_files_on_fields_options_group');
                do_settings_sections('acf_drop_files_on_fields_options_screen');
                submit_button();
              ?>
            </form>
          </div>
        </div>
      </div>
    <?php
  }
  
  function render_section_heading() {
    /* noop */
  }
  
  function render_enabled_for_field($args) {
    $enabled_for = $this->options[$args['name']];
    $registered_field_types = ACF_Drop_Files_On_Fields::get_field_types();

    echo '<ul class="acf-checkbox-list acf-bl">';

    foreach ($registered_field_types as $type => $label) {
      ?>
        <li>
          <label>
            <input
              <?php $this->_print_html_element_atts([
                'type' => 'checkbox',
                'name' => "acf_drop_files_on_fields_options[$args[name]][]",
                'value' => $type,
                'checked' => in_array($type, $enabled_for)
              ]); ?>
            />
            <?php echo $label ?>
          </label>
        </li>
      <?php
    }

    echo '</ul>';
  }

  function render_disabled_for_field($args) {
    $label = __('Main content editor', 'acf-drop-files-on-fields');
    $checked = (bool) (
      is_array($this->options) &&
      array_key_exists($args['name'], $this->options) &&
      array_key_exists('content_editor', $this->options[$args['name']]) &&
      $this->options[$args['name']]['content_editor']
    )
      ? 'checked'
      : '';

    echo "
      <fieldset><legend class='screen-reader-text'><span>$label</span></legend>
        <label for='$args[name]'>
          <input name='acf_drop_files_on_fields_options[$args[name]][content_editor]' type='checkbox' id='$args[name]' value='1' $checked>
          $label
        </label>
      </fieldset>";
  }
  
  function sanitize($input) {
    $output = [];
    $option_names = array_keys(self::get_default_options());
    
    /* Save only the options that are defined in default options */
    foreach($option_names as $n)
      if (isset($input[$n]))
        $output[$n] = $input[$n];
    
    return $output;   
  }

  function _print_html_element_atts($atts) {
    foreach ($atts as $name => $value)
      if (!empty($value)) {
        $value = esc_attr($value);
        echo " $name=\"$value\"";
      }
  }

  public static function get_default_options() {
    return [
      'enabled_for' => ['gallery', 'image', 'file', 'audioVideo'],
      'disabled_for' => ['content_editor']
    ];
  }
}
new ACF_Drop_Files_On_Fields_Settings();
