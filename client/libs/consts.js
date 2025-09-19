// 에셋 본문에서 키워드를 치환하기 위한 재료들
export const assetContentBody = {
  host: '{{HOST}}',
  hostLine: new RegExp('(\{\{HOST\}\}/file/[^/]+/)', 'g'),
}
