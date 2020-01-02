const configs=
    {
        namespaceName: 'idtw',
        region: 'us-ashburn-1',
        pass_phrase: "passphrase123#$",
        authUserId: "ocid1.user.oc1..aanlxphn3tyvn6gmkemlmxtdq",
        identityDomain: "identity.us-ashburn-1.oraclecloud.com",
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaatxffms36xhqc4hekuif6wjnoyq4ilq', //functions-compartment
        tenancyId: "ocid1.tenancy.oc1..aaaaaaasonnihko2igwpjwwe2egmlf3gg6okq",
        keyFingerprint: "33:5f:59:02:b:29:3c:2e:71:0a:62",
        privateKeyPath: "./oci_api_key.pem",
        coreServicesDomain: "iaas.us-ashburn-1.oraclecloud.com",
        streamingAPIEndpoint: "streaming.us-ashburn-1.oci.oraclecloud.com" 
    }

module.exports = {
    configs : configs
};

