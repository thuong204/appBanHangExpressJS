const mongoose = require("mongoose")
const federatedCredentialSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    provider: String,
    subject: String
  });
const FederatedCredential = mongoose.model('FederatedCredential', federatedCredentialSchema);
module.exports =FederatedCredential