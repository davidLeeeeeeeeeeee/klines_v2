const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// 写死的助记词（请替换为你的助记词）
// const MNEMONIC = 'adapt adult reunion prefer mesh spin garment film coffee pulp extend educate';
// const MNEMONIC = 'exchange vault area frog crystal faint time squeeze hard element item isolate';
// const MNEMONIC = 'frost tragic act clean month absent fault seed mango visa tenant meadow';
// const MNEMONIC = 'skin frog profit hole autumn viable spatial foil vote intact gather comic';
// const MNEMONIC = 'monkey sniff resist purity company decade drift skill custom endless raw another';
// const MNEMONIC = 'explain romance memory rack merry ice sea shed annual explain relax jaguar';
// const MNEMONIC = 'forum balcony banner beyond iron cook logic cotton faith sense room face';
// const MNEMONIC = 'food stay theory oxygen orphan inmate quiz coast fiction stick disease electric';
// const MNEMONIC = 'rain execute acid display since salon timber rescue ethics simple gauge spin';
// const MNEMONIC = 'author ozone bonus material report baby report hub wealth wonder confirm captain';
// const MNEMONIC = 'culture hip more wheat brand hammer mix disorder beauty front unlock economy';
// const MNEMONIC = 'short text meat travel round exhibit cute steel december dream electric marble';
// const MNEMONIC = 'brush Burger gold asset wing concert sight you aerobic zero cat follow';
// const MNEMONIC = 'general garage amused repair awesome door refuse ladder develop pair system junior';
// const MNEMONIC = 'vanish witness stable system lake rather amazing drastic canyon avoid broken coast';
// const MNEMONIC = 'vote ahead stomach champion treat detail link broken section side mind book';
// const MNEMONIC = 'limb salt grace wreck stand choose truly valid normal modify defy fence';
// const MNEMONIC = 'pet just hero chimney can trick horror master ticket wash rebuild damp';
// const MNEMONIC = 'clock left Scorpion volcano wedding weird habit column forum twist slot front';
// const MNEMONIC = 'lyrics square August cover skate sibling adult mystery amount scatter badge near';
const MNEMONIC = 'unique  announce goose because vanish angle minute again regret antenna patient transfer';
const OUTPUT_FILE = path.join(__dirname, 'addresses_output.txt');

// 常见的 ETH 派生路径
const DERIVATION_PATHS = [
  // 标准 BIP44 以太坊路径
  { name: 'BIP44 Standard (MetaMask, Ledger Live)', path: "m/44'/60'/0'/0" },
  { name: 'BIP44 Change Address', path: "m/44'/60'/0'/1" },

  // Ledger 相关
  { name: 'Ledger Legacy', path: "m/44'/60'/0'" },
  { name: 'Ledger Live Account 1', path: "m/44'/60'/1'/0" },
  { name: 'Ledger Live Account 2', path: "m/44'/60'/2'/0" },

  // 其他钱包
  { name: 'KeepKey / Jaxx / MyEtherWallet', path: "m/44'/60'/0'" },
  { name: 'Trezor (same as BIP44)', path: "m/44'/60'/0'/0" },
  { name: 'Exodus', path: "m/44'/60'/0'/0" },

  // Ethereum Classic
  { name: 'Ethereum Classic', path: "m/44'/61'/0'/0" },
  { name: 'Ethereum Classic Legacy', path: "m/44'/61'/0'" },

  // BIP49 (通常用于 BTC SegWit，但有些钱包用于 ETH)
  { name: 'BIP49 Style', path: "m/49'/60'/0'/0" },

  // BIP84 (通常用于 BTC Native SegWit，但有些钱包用于 ETH)
  { name: 'BIP84 Style', path: "m/84'/60'/0'/0" },

  // 多账户变体
  { name: 'Account 0 External', path: "m/44'/60'/0'/0" },
  { name: 'Account 1 External', path: "m/44'/60'/1'/0" },
  { name: 'Account 2 External', path: "m/44'/60'/2'/0" },
  { name: 'Account 3 External', path: "m/44'/60'/3'/0" },
  { name: 'Account 4 External', path: "m/44'/60'/4'/0" },

  // 直接派生（无 change）
  { name: 'Direct Derivation', path: "m/44'/60'" },

  // 一些非标准路径
  { name: 'Simple Path', path: "m/44'/60'/0" },
  { name: 'Coinomi Style', path: "m/44'/60'/0'/0" },
];

// 每种路径生成的地址数量
const ADDRESSES_PER_PATH = 100;

async function generateAddresses() {
  const output = [];

  output.push('='.repeat(80));
  output.push('ETH 地址生成器 - 多派生路径');
  output.push('='.repeat(80));
  output.push(`助记词: ${MNEMONIC.split(' ').slice(0, 3).join(' ')}...`);
  output.push(`每种路径生成 ${ADDRESSES_PER_PATH} 个地址`);
  output.push(`生成时间: ${new Date().toLocaleString('zh-CN')}`);
  output.push('');

  for (const { name, path: derivePath } of DERIVATION_PATHS) {
    console.log(`正在生成: ${name}...`);

    output.push('-'.repeat(80));
    output.push(`派生路径: ${name}`);
    output.push(`路径格式: ${derivePath}/index`);
    output.push('-'.repeat(80));
    output.push('Index | Address                                    | Private Key');
    output.push('-'.repeat(120));

    for (let i = 0; i < ADDRESSES_PER_PATH; i++) {
      try {
        const fullPath = `${derivePath}/${i}`;
        const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC, undefined, fullPath);

        output.push(
          `${String(i).padStart(5)} | ${wallet.address} | ${wallet.privateKey}`
        );
      } catch (error) {
        output.push(`${String(i).padStart(5)} | ERROR: ${error.message}`);
      }
    }
    output.push('');
  }

  // 写入文件
  const content = output.join('\n');
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');

  console.log('='.repeat(80));
  console.log(`✅ 生成完成！`);
  console.log(`📁 输出文件: ${OUTPUT_FILE}`);
  console.log(`📊 共 ${DERIVATION_PATHS.length} 种路径，每种 ${ADDRESSES_PER_PATH} 个地址`);
  console.log('='.repeat(80));
}

// 运行生成器
generateAddresses().catch(console.error);
