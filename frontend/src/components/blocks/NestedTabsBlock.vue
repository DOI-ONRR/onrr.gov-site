<template>
  <div>
    <div class="v-tabs__wrap" v-if="content[0].item.tab_block">
      <v-tabs v-model="model">
        <v-tab
          v-for="(tab, index) in content[0].item.tab_block"
          :key="index"
          :href="`#tab-${index}`"
        >
          {{ tab.item.tab_label }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="model">
        <v-tab-item
          v-for="(block, index) in content[0].item.tab_block"
          :key="index"
          :value="`tab-${index}`"
        >
          <v-card text>
            <v-card-text>
              <div v-for="(b, index) in block.item.tab_blocks" :key="index">
                <div v-for="(item, index) in b" :key="index">
                  <div v-if="item.__typename === 'section_heading_blocks'">
                    <ContentBlock
                      :content="item.section_heading"
                      :contentType="item.section_heading_type"
                    ></ContentBlock>
                  </div>
                  <div v-if="item.__typename === 'text_blocks'">
                    <ContentBlock
                      :content="item.content"
                      contentType="body-1"
                    ></ContentBlock>
                  </div>
                  <div v-if="item.__typename === 'content_blocks'">
                    <ContentBlock
                      v-html="item.content"
                      contentType="body-1"
                    ></ContentBlock>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <div else>
      <div v-for="(block, index) in content" :key="index">
        <div v-if="block.item.__typename === 'section_heading_blocks'">
          <ContentBlock
            :content="block.item.section_heading"
            :contentType="block.item.section_heading_type"
          ></ContentBlock>
        </div>
        <div v-if="block.item.__typename === 'content_blocks'">
          <ContentBlock
            v-html="block.item.content"
            contentType="body-1"
          ></ContentBlock>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContentBlock from "@/components/blocks/ContentBlock";

export default {
  name: "NestedTabsBlock",
  data() {
    return {
      model: "tab-0",
    };
  },
  props: {
    content: {
      type: [String, Array],
    },
  },
  components: {
    ContentBlock,
  },
};
</script>