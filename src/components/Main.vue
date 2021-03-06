<template>
  <div v-if="presence">
    <div class="banner">
      <h1 class="banner-header">{{ presence.title }}</h1>
    </div>
    <div v-if="tab === 'builder'" class="presence-builder">
      <div>
        <h2 class="presence-header">Builder</h2>
        <builder :presence-statuses="presenceStatuses" :status-defaults="statusDefaults" @move-up="onMoveUp" @move-down="onMoveDown" @create="onCreate" @remove="onRemove" @save="onSave"></builder>
      </div>
      <div>
        <div style="width: 140px; margin-bottom: 21px" class="switch">
          <input type="checkbox" id="myinput" class="switch-check sr-only" v-model="showPreview">
          <label class="switch-lbl" for="myinput" aria-hidden="true">
            <span class="switch-lbl-txt">Preview</span>
          </label>
        </div>
        <preview-entry v-if="showPreview" :presence-statuses="presenceStatuses" :preview-students="preview_students"></preview-entry>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatusDefault, PresenceStatus, Presence } from '../types';
import APIConfig from '../connect/APIConfig';
import Connector from '../connect/Connector';
import Builder from './Builder.vue';
import PreviewEntry from './PreviewEntry.vue';

@Component({
  components: { Builder, PreviewEntry }
})
export default class Main extends Vue {
  // eslint-disable-next-line
  pdata: any = {};
  connector: Connector|null = null;
  presence: Presence|null = null;
  tab = 'builder';
  showPreview = false;
  
  readonly preview_students = [
    { name: 'Student 1', selected: null },
    { name: 'Student 2', selected: null }
  ];

  @Prop({type: APIConfig, required: true}) readonly apiConfig!: APIConfig;

  async load() : Promise<void> {
    if (!this.connector) { return; }
    
    this.pdata = {
      students: await this.connector.loadStudents(),
      status_defaults: await this.connector.loadStatusDefaults(),
      presences: await this.connector.loadPresences()
    };
    
    if (this.pdata.presences.length) {
      this.presence = this.pdata.presences[0];
    }
  }
  
  get statusDefaults(): PresenceStatusDefault[] {
    if (!this.pdata.status_defaults) { return []; }
    return this.pdata.status_defaults;
  }
  
  get presenceStatuses() : PresenceStatus[] {
    if (!this.presence) { return []; }
    return this.presence.statuses;
  }
  
  onMoveUp(index: number) : void {
    if (!this.presence) { return; }
    if (index <= 0) { return; }
    const statuses = this.presence.statuses;
    this.presence.statuses = statuses.slice(0, index - 1).concat(statuses[index], statuses[index - 1]).concat(statuses.slice(index + 1));
  }
  
  onMoveDown(index: number) : void {
    if (!this.presence) { return; }
    const statuses = this.presence.statuses;
    if (index >= statuses.length - 1) { return; }
    this.presence.statuses = statuses.slice(0, index).concat(statuses[index + 1], statuses[index]).concat(statuses.slice(index + 2));
  }
  
  onCreate(status: PresenceStatus) {
    if (!this.presence) { return; }
    status.id = Math.max.apply(null, this.presence.statuses.map(s => s.id)) + 1;
    status.type = 'custom';
    this.presence.statuses.push(status);
  }
  
  onRemove(status: PresenceStatus) {
    if (!this.presence) { return; }
    if (status.type !== 'custom') { return; }
    const statuses = this.presence.statuses;
    const index = statuses.findIndex(o => o === status);
    if (index === -1) { return; }
    this.presence.statuses = statuses.slice(0, index).concat(statuses.slice(index + 1));
  }
  
  onSave() {
    if (!this.presence) { return; }
    this.connector?.updatePresences(this.presence.id, this.presenceStatuses);
  }

  mounted() : void {
    this.connector = new Connector(this.apiConfig);
    this.load();
  }
}
</script>

<style>
.u-flex {
  display: flex;
}

.u-gap-small {
  gap: 5px;
}

.u-flex-wrap {
  flex-flow: wrap;
}

.u-txt-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn.mod-presence-save:focus {
  color: #fff;
}

.presence-new {
  color: #337ab7;
  cursor: pointer;
}

.presence-new:hover, .presence-new:focus {
  color: #23527c;
  text-decoration: none;
}

.presence-new .fa {
  font-size: 13px;
  margin-right: 5px;
}

.btn.btn-default.mod-presence {
  color: #4d88b3;
  font-size: 14px;
  padding: 2px 5px;
  width: 25px;
}

.btn.mod-presence.mod-cancel .fa {
  color: red;
}

.form-control.mod-input {
  height: initial;
  padding: 2px 5px;
}

.form-control.mod-input.mod-small {
  width: 50px;
}

.form-control.mod-select {
  height: 26px;
  padding: 3px 5px;
  width: initial;
}

.banner {
  background-color: #2b6597;
  border-bottom: 1px solid #14578f;
  padding: 20px 15px;
}

.banner-header {
  color: #fff;
  font-size: 2.2rem;
  margin: 0;
}

.presence-header {
  color: #507177;
  font-size: 1.6rem;
  margin: 0 0 25px 8px;
}

.presence-builder {
  align-items: baseline;
  display: flex;
  gap: 40px;
  margin: 25px 20px 20px;
}

@media only screen and (max-width: 840px) {
  .presence-builder {
    flex-flow: wrap;
  }
}

.presence-swatches {
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(11, 1fr);
  padding: 2px;
}

.color, .color-code {
  background-color: var(--color);
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--text-color);
}

.color[disabled] {
  cursor: not-allowed;
  opacity: .4;
}

.color {
  height: 16px;
  width: 40px;
}

.color.mod-swatch {
  width: 20px;
  z-index: 1000;
}

.table.mod-presence .color {
  transition: opacity 200ms linear, background 75ms linear;
}

.color-code {
  transition: background 75ms linear, color 75ms linear;
}

.table.mod-builder .color.is-selected, .table.mod-builder .color:hover, .table-period .color-code:not(.is-selected):hover {
  box-shadow: 1px 1px 2px -1px #673ab7;
}

.color-code.is-selected {
  box-shadow: 0 0 0 .2rem var(--selected-color);
}

.color-code.mod-none {
  --color: #deede1;
  background: none;
  background-image: linear-gradient(135deg, var(--color) 10%, transparent 10%, transparent 50%, var(--color) 50%, var(--color) 60%, transparent 60%, transparent 100%);
  background-size: 7px 7px;
  border-radius: 5px;
  height: 17px;
}

.color.mod-swatch.is-selected {
  position: relative;  
}

.color.mod-swatch.is-selected:after {
  content: '\f00c';
  font-family: 'FontAwesome';
  font-size: 11px;
  left: calc(50% - .5em);
  position: absolute;
  text-align: center;
  top: 0;
}

.color-code {
  display: flex;
  height: 20px;
  min-width: 40px;
  padding: 2px 4px;
  justify-content: center;
}

.color-code > span {
  font-size: 14px;
  font-variant: all-small-caps;
  font-weight: 900;
  line-height: 12px;
}

.color-code.is-selected {
  position: relative;
}

.color-code.is-selected:after {
  background-color: inherit;
/*  border: 1px solid rgba(255, 255, 255, .92);*/
  border-radius: 50%;
  bottom: -5px;
  content: '\f00c';
  font-family: 'FontAwesome';
  font-size: 8px;
  font-weight: 400;
  line-height: 8px;
  padding: 2px 1px 1px 2px;
  position: absolute;
  right: -5px;
  z-index: 10;
}

.switch-lbl {
  border-radius: .375rem;
  box-shadow: inset var(--x-offset) 4px 10px rgba(0, 0, 0, .15);
  color: #fff;
  display: inline-block;
  margin-bottom: 0;
  padding: .25rem .5rem;
  position: relative;
  transition: background 0.3s ease-in-out;
  width: 100%;
}

.switch-check:not(:checked) + .switch-lbl {
  background: #A2B4B2;
  --x-offset: 3px;
}

.switch-check:checked + .switch-lbl {
  background: #1b8a85;
  --x-offset: -3px;
}

.switch-lbl:before {
  background-color: white;
  border-radius: .2rem;
  bottom: .15rem;
  content: '';
  position: absolute;
  top: .15rem;
  transition: left 0.3s cubic-bezier(.175, .885, .32, .97);
  width: 1rem;
}

.switch-check:not(:checked) + .switch-lbl:before {
  left: .15rem;
}

.switch-check:checked + .switch-lbl:before {
  left: calc(100% - 1.15rem);
}

.switch-lbl-txt:before {
  transition: margin .3s ease-in-out;
}

.switch-check:not(:checked) + .switch-lbl .switch-lbl-txt:before {
  content: attr(data-off);
  margin-left: 1.1rem;
}

.switch-check:checked + .switch-lbl .switch-lbl-txt:before {
  content: attr(data-on);
  margin-left: 0;
}

.table.mod-presence {
  border-top-color: #ebebeb;
}

.table.mod-presence thead th:not(.table-actions) {
  background-color: #f8fbfb;
}

.table.mod-presence.mod-builder thead th:not(.table-actions) {
  border-top: 1px solid #ebebeb;
}

.table.mod-presence thead th {
  color: #727879;
}

.table.mod-presence th, .table.mod-presence td {
  border: 1px solid #ebebeb;
  vertical-align: middle;
}

.table.mod-presence .table-actions {
  border: 0;
}

.table.mod-builder {
  border-right: 0;
  border-bottom: 0;
  border-top: 0;
}

.table.mod-presence tbody {
  transition: opacity 200ms linear;
}

.table.mod-presence thead th {
  border-bottom: 0;
}

.table.mod-presence tbody tr:first-child td:not(.table-actions) {
  background: linear-gradient(to bottom, #e3eaed 0, rgba(255, 255, 255, 0) 4px);
  border-top: 0;
}

.table.mod-builder {
  margin-bottom: 0;
  width: fit-content;
}

.table.mod-builder .form-control {
  transition: background 200ms linear;
}

.table.mod-builder.is-changes-disabled tbody {
  opacity: .8;
}

.table.mod-builder tfoot th {
  font-weight: 400;
}

.table.mod-builder {
  position: relative;
}

.table.mod-builder td {
  padding: 0;
}

.table.mod-builder .cell-pad {
  padding: 8px;
}

.table.mod-builder .cell-pad-x {
  padding: 0 8px;
}

@media only screen and (max-width: 459px) {
  .table.mod-builder .presence-actions {
    position: absolute;
    right: 17px;
    bottom: -45px;
  }
  
  .table.mod-builder .btn.mod-presence {
    font-size: 20px;
    width: unset;
  }
}

@media (pointer:fine) {
  .table.mod-builder tbody tr:hover td:not(.table-actions) {
    background: #f4fbfb;
    cursor: pointer;
  }
  
  .table.mod-builder tbody tr:first-child:hover td:not(.table-actions) {
    background: linear-gradient(to bottom, #e3eaed 0, #f4fbfb 4px);
  }

  .table.mod-builder tbody tr:hover td:not(.table-actions) {
    border-color: #e3e3e3;
  }
}

.table.mod-builder tbody tr.is-selected td:not(.table-actions){
  background: #ecf4f4;
}

.table.mod-builder tbody tr.is-selected:first-child td:not(.table-actions) {
  background: linear-gradient(to bottom, #e3eaed 0, #ecf4f4 4px);
}

.table.mod-builder tbody tr.is-selected td:not(.table-actions) {
  border-color: #e3e3e3;
}

.table.mod-builder.is-changes-disabled tbody tr, .table.mod-builder.is-changes-disabled tbody tr:hover  {
  background: unset;
  border-color: unset;
  cursor: unset;
}

.table.mod-builder tr.is-selected .btn.mod-presence:last-child:not(:disabled) {
  color: red;
}

.table.mod-builder tbody tr:not(.is-selected) .table-actions {
  pointer-events: none;
}

.table.mod-builder tbody tr:not(.is-selected) .btn.mod-presence {
  pointer-events: none;
  opacity: 0;
  box-shadow: none;
}

/*.radio-tabs-default {
  background-color: rgba(255, 255, 255, .45);
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
  color: #337ab7;
}

.radio-tabs-default:hover, .radio-tabs-default:focus {
  background-color: #fff;
  box-shadow: 0 1px 2px hsla(208, 55%, 25%, .10);
  color: #507177;
}

.radio-tabs {
  cursor: pointer;
  font-weight: normal;
  margin: 0;
  padding: 0 .5em;
}

.radio-tabs-active, .radio-tabs-active:hover, .radio-tabs-active:focus  {
  background-color: #fff;
  box-shadow: 0 1px 2px hsla(208, 55%, 25%, .40);
  color: #507177;
}*/

.table.mod-entry th.table-result {
  max-width: 1px;
}

.table.mod-entry .table-period {
  border-right: 0;
}

.table.mod-entry .table-result {
  border-left: 0;
}

.table-period {
  position: relative;
}

.table-result .result-wrap {
  margin: 0 auto;
  max-width: fit-content;
}

.table.mod-entry tbody .table-period:after {
  background-color: #ebebeb;
  bottom: 8px;
  content: '';
  display: block;
  position: absolute;
  right: -1px;
  top: 8px;
  width: 1px;
}
</style>

<style lang="scss">
:root {
  --text-color-dark: #333;
  --text-color-light: #fff;
}

/*  Material Design colors
 *  Credits:
 *
 *  Original color palette by
 *  https://www.google.com/design/spec/style/color.html
 */

.pink-100 { $color: #f8bbd0; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.pink-300 { $color: #f06292; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 20%)}; }
.pink-500 { $color: #e91e63; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 30%)}; }
.pink-700 { $color: #c2185b; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 40%)}; }
.pink-900 { $color: #880e4f; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 50%)}; }

.blue-100 { $color: #bbdefb; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.blue-300 { $color: #64b5f6; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 15%)}; }
.blue-500 { $color: #2196f3; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 25%)}; }
.blue-700 { $color: #1976d2; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 30%)}; }
.blue-900 { $color: #0d47a1; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 40%)}; }

.cyan-100 { $color: #b2ebf2; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.cyan-300 { $color: #4dd0e1; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 25%)}; }
.cyan-500 { $color: #00bcd4; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 5%)}; }
.cyan-700 { $color: #0097a7; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 15%)}; }
.cyan-900 { $color: #006064; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 25%)}; }

.teal-100 { $color: #b2dfdb; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.teal-300 { $color: #4db6ac; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 25%)}; }
.teal-500 { $color: #009688; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 5%)}; }
.teal-700 { $color: #00796b; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 15%)}; }
.teal-900 { $color: #004d40; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 20%)}; }

.green-100 { $color: #c8e6c9; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.green-300 { $color: #81c784; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 10%)}; }
.green-500 { $color: #4caf50; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 10%)}; }
.green-700 { $color: #388e3c; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 15%)}; }
.green-900 { $color: #1b5e20; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 25%)}; }

.light-green-100 { $color: #dcedc8; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 15%)}; }
.light-green-300 { $color: #aed581; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 15%)}; }
.light-green-500 { $color: #8bc34a; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 15%)}; }
.light-green-700 { $color: #689f38; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 15%)}; }
.light-green-900 { $color: #33691e; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 25%)}; }

.lime-100 { $color: #f0f4c3; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 15%)}; }
.lime-300 { $color: #dce775; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 15%)}; }
.lime-500 { $color: #cddc39; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.lime-700 { $color: #afb42b; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 10%)}; }
.lime-900 { $color: #827717; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 20%)}; }

.yellow-100 { $color: #fff9c4; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 30%)}; }
.yellow-300 { $color: #fff176; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 25%)}; }
.yellow-500 { $color: #ffeb3b; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 15%)}; }
.yellow-700 { $color: #fbc02d; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.yellow-900 { $color: #f57f17; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 10%)}; }

.amber-100 { $color: #ffecb3; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 20%)}; }
.amber-300 { $color: #ffd54f; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 20%)}; }
.amber-500 { $color: #ffc107; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.amber-700 { $color: #ffa000; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 7%)}; }
.amber-900 { $color: #ff6f00; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 10%)}; }

.deep-orange-100 { $color: #ffccbc; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 10%)}; }
.deep-orange-300 { $color: #ff8a65; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 20%)}; }
.deep-orange-500 { $color: #ff5722; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 15%)}; }
.deep-orange-700 { $color: #e64a19; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{darken($color, 15%)}; }
.deep-orange-900 { $color: #bf360c; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 30%)}; }

.grey-100 { $color: #f5f5f5; --color: #{$color}; --text-color: var(--text-color-dark);  --selected-color: #{darken($color, 20%)}; }
.grey-300 { $color: #e0e0e0; --color: #{$color}; --text-color: var(--text-color-dark); --selected-color: #{darken($color, 30%)}; }
.grey-500 { $color: #9e9e9e; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 15%)}; }
.grey-700 { $color: #616161; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 45%)}; }
.grey-900 { $color: #212121; --color: #{$color}; --text-color: var(--text-color-light); --selected-color: #{lighten($color, 55%)}; }

</style>

<style>
.popover {
    top: 0;
    left: 0;
    z-index: 1060;
    max-width: 276px;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
    text-decoration: none;
    text-shadow: none;
    text-transform: none;
    letter-spacing: normal;
    word-break: normal;
    word-spacing: normal;
    white-space: normal;
    line-break: auto;
    font-size: .875rem;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.2);
    border-radius: .3rem;
}
.popover, .popover .arrow {
    position: absolute;
    display: block;
}
.bs-popover-auto[x-placement^=right], .bs-popover-right {
    margin-left: .5rem;
}
.popover.b-popover {
    display: block;
    opacity: 1;
    outline: 0;
}
.popover .arrow {
    width: 1rem;
    height: .5rem;
    margin: 0 .3rem;
}
.bs-popover-auto[x-placement^=right]>.arrow, .bs-popover-right>.arrow {
    left: calc(-.5rem - 1px);
    width: .5rem;
    height: 1rem;
    margin: .3rem 0;
}
.bs-popover-auto[x-placement^=left], .bs-popover-left {
    margin-right: .5rem;
}
.bs-popover-auto[x-placement^=bottom], .bs-popover-bottom {
    margin-top: .5rem;
}
.bs-popover-auto[x-placement^=top], .bs-popover-top {
    margin-bottom: .5rem;
}
.popover .arrow:after, .popover .arrow:before {
    position: absolute;
    display: block;
    content: "";
    border-color: transparent;
    border-style: solid;
}
.bs-popover-auto[x-placement^=right]>.arrow:before, .bs-popover-right>.arrow:before {
    left: 0;
    border-width: .5rem .5rem .5rem 0;
    border-right-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=right]>.arrow:after, .bs-popover-right>.arrow:after {
    left: 1px;
    border-width: .5rem .5rem .5rem 0;
    border-right-color: #fff;
}
.bs-popover-auto[x-placement^=bottom]>.arrow:before, .bs-popover-bottom>.arrow:before {
    top: 0;
    border-width: 0 .5rem .5rem;
    border-bottom-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=bottom]>.arrow:after, .bs-popover-bottom>.arrow:after {
    top: 1px;
    border-width: 0 .5rem .5rem;
    border-bottom-color: #fff;
}
.bs-popover-auto[x-placement^=top]>.arrow:before, .bs-popover-top>.arrow:before {
    bottom: 0;
    border-width: .5rem .5rem 0;
    border-top-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=top]>.arrow:after, .bs-popover-top>.arrow:after {
    bottom: 1px;
    border-width: .5rem .5rem 0;
    border-top-color: #fff;
}
.bs-popover-auto[x-placement^=left]>.arrow:before, .bs-popover-left>.arrow:before {
    right: 0;
    border-width: .5rem 0 .5rem .5rem;
    border-left-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=left]>.arrow:after, .bs-popover-left>.arrow:after {
    right: 1px;
    border-width: .5rem 0 .5rem .5rem;
    border-left-color: #fff;
}
</style>