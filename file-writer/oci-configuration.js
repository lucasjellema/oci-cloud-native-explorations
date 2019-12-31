const configs=
    {
        namespaceName: 'idtwhanz',
        region: 'us-ashburn-1',
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaatxwjnoyq4ilq', //functions-compartment
        pass_phrase: "passphrase123#$",
        authUserId: "ocid1.user.oc1..aaaaaaamlmxtdq",
        identityDomain: "identity.us-ashburn-1.oraclecloud.com",
        tenancyId: "ocid1.tenancy.oc1..aaaaaagg6okq",
        keyFingerprint: "33:5f:59:02:07:18:d5:62",
        privateKeyPath: "./oci_api_key.pem",
        coreServicesDomain: "iaas.us-ashburn-1.oraclecloud.com",
        bucketOCID: "ocid1.bucket.oc1.iad.aaaaahf3jwdqf5ezmq",
        bucketName:"fn-bucket",
        objectStorageAPIEndpoint:"objectstorage.us-ashburn-1.oraclecloud.com"
    }

module.exports = {
    configs : configs
};

