<template>
  <div v-if="presence">
    <div style="background-color: #2b6597;padding: 20px 15px;border-bottom: 1px solid #14578f">
      <h1 style="margin: 0;color: #fff;font-size: 2.2rem">{{ presence.title }}</h1>
    </div>
    <div v-if="tab === 'builder'" style="display: flex;margin-top:25px; margin-left: 20px; gap:60px;align-items:baseline;flex-flow:wrap;margin-bottom: 20px">
      <div class="presence-builder">
        <h2 class="presence-header">Builder</h2>
        <builder :presence-statuses="orderedPresenceStatuses" :status-defaults="fixedStatusDefaults" @moved-up="onMovedUp" @moved-down="onMovedDown"></builder>
      </div>
      <div style="display: flex;gap:60px;align-items:baseline;flex:1;flex-flow:wrap;margin-bottom: 20px">
      <div>
        <h2 class="presence-header">Preview Entry 'Presence 1'</h2>
        <preview-entry :presence-statuses="orderedPresenceStatuses" :preview-students="preview_students" :options="preview_options"></preview-entry>
      </div>
      <div>
        <h2 class="presence-header">Preview Result</h2>
        <preview-result :presence-statuses="orderedPresenceStatuses" :preview-students="preview_students" :display-selected="preview_options.display_selected"></preview-result>
      </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus, ExtraStatus, Presence } from '../types';
import APIConfig from '../connect/APIConfig';
import Connector from '../connect/Connector';
import Builder from './Builder.vue';
import PreviewEntry from './PreviewEntry.vue';
import PreviewResult from './PreviewResult.vue';

@Component({
  components: { Builder, PreviewEntry, PreviewResult }
})
export default class Main extends Vue {
  // eslint-disable-next-line
  pdata: any = {};
  connector: Connector|null = null;
  presence: Presence|null = null;
  tab = 'builder';
  
  readonly preview_options = {
    display_selected: 'color-code'
  };
  
  readonly preview_students = [
    { name: 'Student 1', selected: 3 }, 
    { name: 'Student 2', selected: 3 }, 
    { name: 'Student 3', selected: 3 }, 
    { name: 'Student 4', selected: 1 }, 
    { name: 'Student 5', selected: 1 }
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
  
  get fixedStatusDefaults() : PresenceStatus[] {
    if (!this.pdata.status_defaults) { return []; }
    return this.pdata.status_defaults.filter((s : PresenceStatus) => !s.aliasses);
  }
  
  get presenceStatuses() : PresenceStatus[] {
    if (!this.presence || !this.presence.metadata) { return []; }

    const statuses : PresenceStatus[] = [].concat(this.pdata.status_defaults);
    const extraStatuses : ExtraStatus[] = this.presence.metadata.statuses;
    extraStatuses.forEach(status => {
      if (status['ref-id']) {
        const s = statuses.find(s => s.id === status['ref-id']);
        if (s && status['color']) {
          s.color = status['color'];
        }
        if (s && status['code']) {
          s.code = status['code'];
        }
      } else {
        statuses.push(status as unknown as PresenceStatus);
      }
    });
    return statuses;
  }
  
  get orderedPresenceStatuses() : PresenceStatus[] {
    if (!this.presence || !this.presence.metadata) { return []; }

    const presenceStatuses = this.presenceStatuses;
    return this.presence.metadata.order
      .map(i => presenceStatuses.find(s => s.id === i))
      .filter((status) : status is PresenceStatus => typeof status !== undefined);
  }
  
  onMovedUp(index: number) : void {
    if (!this.presence || !this.presence.metadata) { return; }
    if (index <= 0) { return; }

    const order = this.presence.metadata.order;
    this.presence.metadata.order = order.slice(0, index - 1).concat(order[index], order[index - 1]).concat(order.slice(index + 1));
  }
  
  onMovedDown(index: number) : void {
    if (!this.presence || !this.presence.metadata) { return; }

    const order = this.presence.metadata.order;
    if (index >= order.length - 1) { return; }
    this.presence.metadata.order = order.slice(0, index).concat(order[index + 1], order[index]).concat(order.slice(index + 2));
  }

  mounted() : void {
    this.connector = new Connector(this.apiConfig);
    this.load();
  }
}
</script>

<style>
.form-control.mod-input {
  height: initial;
  padding: 2px 5px;
}
.form-control.mod-select {
  height: initial;
  padding: 3px 5px;
  width: initial;
}
.table.mod-presence {
  border-top-color: #ebebeb;
}
.table.mod-presence thead {
  background-color: #f8fbfb;
}
.table.mod-presence th {
  color: #727879;
}
.table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td {
  border: 1px solid #ebebeb;
}
.table.mod-presence tbody {
  background: linear-gradient(to bottom, #e3eaed 0, transparent 4px);
  transition: opacity 200ms linear;
}
.table.mod-presence tbody .form-control {
  transition: background 200ms linear;
}

.table.mod-presence > tbody > tr > td {
  vertical-align: middle;
}

.table.mod-presence > tfoot > tr > th {
  vertical-align: middle;
}

.table.mod-presence.is-changes-disabled tbody {
    opacity: .8;
}

.presence-header {
  margin: 0 0 25px 8px;color: #507177;font-size: 1.6rem;
}

.color {
  background-color: var(--color);
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--text-color);
  width: 40px;
  height: 16px;
  cursor: pointer;
}

.color.is-selected, .color-code.is-selected {
/*  box-shadow: 1px 1px 3px #0000cc, inset 1px 1px 1px #0000cc;*/
  
/*  box-shadow: 1px 0px 3px hsla(212, 79%, 48%, .6);*/
  box-shadow: 1px 1px 2px -1px #673ab7;
/*  border-color: #1384e7;*/
}
.color:hover, .color-code:hover {
  box-shadow: 1px 1px 2px -1px #673ab7;
}

.color-code {
  background-color: var(--color);
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--text-color);
  min-width: 40px;
  height: 20px;
  /*text-shadow: 1px 0 1px darkblue, -1px 0px 2px darkblue;*/
  font-weight: 900;
  font-size: 14px;
  padding: 2px 4px;
  text-align: center;
  line-height: 12px;
  cursor: pointer;
  font-variant: all-small-caps;
}

.color-code.is-selected {
    position: relative;
}

.color-code.is-selected::after {
    content: '\f00c';
    font-family: 'FontAwesome';
    position: absolute;
    font-size: 11px;
    background-color: inherit;
    right: -4px;
    bottom: -4px;
    border: 1px solid #ffffff8f;
    border-radius: 50%;
    line-height: 8px;
    z-index: 10;
}

.btn-code.selected {
  background-color: lightblue;
  border: 1px solid #767676;
  border-radius: 3px;
.color.is-selected {
  position: relative;  
}

.color.is-selected::after {
  content: '\f00c';
  font-family: 'FontAwesome';
  text-align: center;
  position:absolute;
  font-size: 11px;
  left: calc(50% - .5em);
}
}

tfoot th {
  font-weight: 400;
}

@media only screen and (min-width: 610px) {
  .presence-builder {
    min-width: 570px;
  }
}

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

.pink-100 { --color: #f8bbd0; --text-color: var(--text-color-dark); }
.pink-300 { --color: #f06292; --text-color: var(--text-color-light); }
.pink-500 { --color: #e91e63; --text-color: var(--text-color-light); }
.pink-700 { --color: #c2185b; --text-color: var(--text-color-light); }
.pink-900 { --color: #880e4f; --text-color: var(--text-color-light); }

.blue-100 { --color: #bbdefb; --text-color: var(--text-color-dark); }
.blue-300 { --color: #64b5f6; --text-color: var(--text-color-light); }
.blue-500 { --color: #2196f3; --text-color: var(--text-color-light); }
.blue-700 { --color: #1976d2; --text-color: var(--text-color-light); }
.blue-900 { --color: #0d47a1; --text-color: var(--text-color-light); }

.cyan-100 { --color: #b2ebf2; --text-color: var(--text-color-dark); }
.cyan-300 { --color: #4dd0e1; --text-color: var(--text-color-light); }
.cyan-500 { --color: #00bcd4; --text-color: var(--text-color-light); }
.cyan-700 { --color: #0097a7; --text-color: var(--text-color-light); }
.cyan-900 { --color: #006064; --text-color: var(--text-color-light); }

.teal-100 { --color: #b2dfdb; --text-color: var(--text-color-light); }
.teal-300 { --color: #4db6ac; --text-color: var(--text-color-light); }
.teal-500 { --color: #009688; --text-color: var(--text-color-light); }
.teal-700 { --color: #00796b; --text-color: var(--text-color-light); }
.teal-900 { --color: #004d40; --text-color: var(--text-color-light); }

.green-100 { --color: #c8e6c9; --text-color: var(--text-color-dark); }
.green-300 { --color: #81c784; --text-color: var(--text-color-light); }
.green-500 { --color: #4caf50; --text-color: var(--text-color-light); }
.green-700 { --color: #388e3c; --text-color: var(--text-color-light); }
.green-900 { --color: #1b5e20; --text-color: var(--text-color-light); }

.light-green-100 { --color: #dcedc8; --text-color: var(--text-color-dark); }
.light-green-300 { --color: #aed581; --text-color: var(--text-color-light); }
.light-green-500 { --color: #8bc34a; --text-color: var(--text-color-light); }
.light-green-700 { --color: #689f38; --text-color: var(--text-color-light); }
.light-green-900 { --color: #33691e; --text-color: var(--text-color-light); }

.lime-100 { --color: #f0f4c3; --text-color: var(--text-color-dark); }
.lime-300 { --color: #dce775; --text-color: var(--text-color-dark); }
.lime-500 { --color: #cddc39; --text-color: var(--text-color-dark); }
.lime-700 { --color: #afb42b; --text-color: var(--text-color-light); }
.lime-900 { --color: #827717; --text-color: var(--text-color-light); }

.yellow-100 { --color: #fff9c4; --text-color: var(--text-color-dark); }
.yellow-300 { --color: #fff176; --text-color: var(--text-color-dark); }
.yellow-500 { --color: #ffeb3b; --text-color: var(--text-color-dark); }
.yellow-700 { --color: #fbc02d; --text-color: var(--text-color-dark); }
.yellow-900 { --color: #f57f17; --text-color: var(--text-color-light); }

.amber-100 { --color: #ffecb3; --text-color: var(--text-color-dark); }
.amber-300 { --color: #ffd54f; --text-color: var(--text-color-dark); }
.amber-500 { --color: #ffc107; --text-color: var(--text-color-dark); }
.amber-700 { --color: #ffa000; --text-color: var(--text-color-light); }
.amber-900 { --color: #ff6f00; --text-color: var(--text-color-light); }

.deep-orange-100 { --color: #ffccbc; --text-color: var(--text-color-dark); }
.deep-orange-300 { --color: #ff8a65; --text-color: var(--text-color-light); }
.deep-orange-500 { --color: #ff5722; --text-color: var(--text-color-light); }
.deep-orange-700 { --color: #e64a19; --text-color: var(--text-color-light); }
.deep-orange-900 { --color: #bf360c; --text-color: var(--text-color-light); }
</style>