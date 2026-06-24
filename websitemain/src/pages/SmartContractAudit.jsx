import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Lock,
  Code,
  ExternalLink,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SmartContractAudit() {
  const auditResults = {
    overallScore: 92,
    status: "Passed",
    dateAudited: "2024-11-15",
    auditor: "CertiK Security",
    contractAddress: "0xf8e81D47203A594245E36C48e151709F0C19fBe8",
    network: "Sepolia Testnet"
  };

  const securityChecks = [
    {
      category: "Access Control",
      status: "passed",
      severity: "critical",
      findings: 0,
      description: "Owner-only functions properly restricted"
    },
    {
      category: "Reentrancy Protection",
      status: "passed",
      severity: "critical",
      findings: 0,
      description: "No reentrancy vulnerabilities detected"
    },
    {
      category: "Integer Overflow/Underflow",
      status: "passed",
      severity: "high",
      findings: 0,
      description: "SafeMath implementation verified"
    },
    {
      category: "Gas Optimization",
      status: "warning",
      severity: "low",
      findings: 2,
      description: "Minor gas optimization opportunities"
    },
    {
      category: "Code Quality",
      status: "passed",
      severity: "medium",
      findings: 0,
      description: "Follows Solidity best practices"
    },
    {
      category: "Token Standards",
      status: "passed",
      severity: "high",
      findings: 0,
      description: "ERC-20 standard compliance verified"
    }
  ];

  const vulnerabilities = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 2
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Smart Contract Security Audit
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Independent security audit report for Datatrek smart contracts
          </p>
        </div>

        {/* Audit Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card border-0 glow-hover">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-6 md:mb-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-green-600 mb-1">
                      {auditResults.overallScore}/100
                    </h2>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {auditResults.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Date Audited</p>
                    <p className="font-semibold">{auditResults.dateAudited}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Audited By</p>
                    <p className="font-semibold">{auditResults.auditor}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Network</p>
                    <p className="font-semibold">{auditResults.network}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Contract</p>
                    <p className="font-mono text-xs">
                      {auditResults.contractAddress.slice(0, 10)}...
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vulnerability Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {vulnerabilities.critical}
              </div>
              <p className="text-sm text-gray-600">Critical</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {vulnerabilities.high}
              </div>
              <p className="text-sm text-gray-600">High</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {vulnerabilities.medium}
              </div>
              <p className="text-sm text-gray-600">Medium</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {vulnerabilities.low}
              </div>
              <p className="text-sm text-gray-600">Low</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Checks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <span>Security Checks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityChecks.map((check, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        check.status === 'passed' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {check.status === 'passed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{check.category}</h4>
                          <Badge 
                            className={`text-xs ${
                              check.severity === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                              check.severity === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              check.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                            }`}
                          >
                            {check.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{check.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge className={`${
                        check.status === 'passed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {check.findings} issues
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contract Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-600" />
                <span>Contract Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/50 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Contract Address</span>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      View on Etherscan
                    </Button>
                  </div>
                  <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">
                    {auditResults.contractAddress}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Compiler Version</p>
                    <p className="font-semibold">Solidity 0.8.19</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">License</p>
                    <p className="font-semibold">MIT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-bold mb-2">Full Audit Report</h3>
              <p className="text-gray-600 mb-6">
                Download the complete security audit report with detailed findings and recommendations
              </p>
              <Button className="gradient-purple-cyan text-white px-8 py-6 rounded-xl">
                <Download className="w-5 h-5 mr-2" />
                Download PDF Report
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}