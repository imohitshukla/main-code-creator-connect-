
import dns from 'dns';

const host1 = 'ep-fragrant-water-ah4w7ajv.c-3.us-east-1.aws.neon.tech';
const host2 = 'ep-fragrant-water-ah4w7ajv.us-east-1.aws.neon.tech';

console.log(`Node ${process.version}`);
console.log('Testing DNS resolution...');

dns.lookup(host1, (err, address) => {
    if (err) console.error(`❌ ${host1}:`, err.code);
    else console.log(`✅ ${host1}:`, address);
});

dns.lookup(host2, (err, address) => {
    if (err) console.error(`❌ ${host2}:`, err.code);
    else console.log(`✅ ${host2}:`, address);
});
