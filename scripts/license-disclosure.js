export const LICENSE_ANCHOR = 'license-and-disclosure';

export function appendLicenseAndDisclosure(lines, { includeAnchor = false } = {}) {
  if (includeAnchor) {
    lines.push(`<a id="${LICENSE_ANCHOR}"></a>`);
    lines.push('');
  }

  lines.push('## 📄 许可与利益披露');
  lines.push('');
  lines.push('除另有说明外，本仓库的原创内容、数据和文档采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可协议。');
  lines.push('');
  lines.push('你可以在非商业目的下复制、修改和分享相关内容，但须保留 `VPSKnow / everettlabs` 署名及原项目链接，注明修改，并以相同协议共享。');
  lines.push('');
  lines.push('未经书面授权，不得将本项目内容用于商业目的。以获取佣金、返利、广告收入、付费导流或其他商业利益为目的的使用，属于商业性使用。');
  lines.push('');
  lines.push('本项目部分直达链接为推广链接，维护者可能获得佣金或返利。相关合作不影响机场的收录、评价和下架标准。');
  lines.push('');
  lines.push('Fork 或修改版本中的链接、排序和评价仅代表修改者，不代表 VPSKnow 官方观点。第三方名称、商标和 Logo 的权利归各自权利人所有。');
  lines.push('');
  lines.push('---');
  lines.push('');
}
