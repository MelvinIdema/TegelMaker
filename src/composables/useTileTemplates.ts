export interface TileTemplate {
  id: number
  name: string
  text: string
  preview: string
}

export function useTileTemplates() {
  const tileOptions: TileTemplate[] = [
    {
      id: 1,
      name: 'Verjaardag Tegel',
      text: `Ben ik verdorie\n<b>28</b>\ngeworden krijg ik\nzo'n achterlijk\n<b>kut tegeltje</b>`,
      preview: "Ben ik verdorie 28 geworden krijg ik zo'n achterlijk kut tegeltje",
    },
    {
      id: 2,
      name: 'Voetbal Tegel',
      text: `Neuken?\nNee!\n<b>OSS</b> speelt`,
      preview: 'Neuken? Nee! OSS speelt',
    },
    {
      id: 3,
      name: 'Auto Tegel',
      text: `Neuken?\nNee!\nIk werk aan mijn\n<b>Dodge</b>`,
      preview: 'Neuken? Nee! Ik werk aan mijn Dodge',
    },
  ]

  const selectedTileId = ref<number>(1)
  const selectedTemplate = computed(
    () => tileOptions.find((tile) => tile.id === selectedTileId.value) || tileOptions[0],
  )

  function selectTemplate(templateId: number) {
    selectedTileId.value = templateId
  }

  return {
    tileOptions,
    selectedTileId: readonly(selectedTileId),
    selectedTemplate,
    selectTemplate,
  }
}
