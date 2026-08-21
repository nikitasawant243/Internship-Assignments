/**
 * ML-Based SLA Breach Prediction Service
 * Uses statistical analysis and pattern recognition to predict PR delays
 */

const stats = require('simple-statistics');

class MLPredictor {
    
    /**
     * Predict SLA breach probability using multiple factors
     * @param {Object} pr - Purchase Requisition data
     * @param {Array} historicalData - Historical PR data for learning
     * @returns {Object} Prediction result with probability and confidence
     */
    predictSLABreach(pr, historicalData = []) {
        
        // Extract features from PR
        const features = this.extractFeatures(pr);
        
        // Calculate base probability using current state
        const baseProbability = this.calculateBaseProbability(features);
        
        // Adjust probability based on historical patterns
        const adjustedProbability = this.adjustWithHistoricalData(
            baseProbability,
            features,
            historicalData
        );
        
        // Calculate confidence score
        const confidence = this.calculateConfidence(features, historicalData);
        
        // Determine risk level
        const riskLevel = this.determineRiskLevel(adjustedProbability);
        
        return {
            probability: Math.round(adjustedProbability * 100) / 100,
            confidence: Math.round(confidence * 100) / 100,
            riskLevel: riskLevel,
            factors: this.identifyKeyFactors(features, adjustedProbability)
        };
    }
    
    /**
     * Extract relevant features from PR for prediction
     */
    extractFeatures(pr) {
        const today = new Date();
        const createdDate = new Date(pr.createdDate);
        const ageDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
        
        return {
            ageDays: ageDays,
            slaDays: pr.slaDays || 5,
            ageRatio: ageDays / (pr.slaDays || 5),
            departmentCode: pr.departmentCode,
            status: pr.status,
            approvalStatus: pr.approvalStatus,
            isPending: pr.status === 'Pending',
            quantity: pr.quantity || 0,
            hasApprovalDate: !!pr.approvalDate
        };
    }
    
    /**
     * Calculate base probability using current PR state
     */
    calculateBaseProbability(features) {
        let probability = 0;
        
        // Age-based probability (most important factor)
        if (features.ageRatio >= 1.0) {
            // Already breached
            probability = 0.95;
        } else if (features.ageRatio >= 0.9) {
            // Very close to breach (90%+ of SLA used)
            probability = 0.85;
        } else if (features.ageRatio >= 0.75) {
            // High risk (75-90% of SLA used)
            probability = 0.65;
        } else if (features.ageRatio >= 0.6) {
            // Medium-high risk (60-75% of SLA used)
            probability = 0.45;
        } else if (features.ageRatio >= 0.4) {
            // Medium risk (40-60% of SLA used)
            probability = 0.25;
        } else if (features.ageRatio >= 0.2) {
            // Low-medium risk (20-40% of SLA used)
            probability = 0.10;
        } else {
            // Low risk (< 20% of SLA used)
            probability = 0.05;
        }
        
        // Adjust for pending status
        if (features.isPending) {
            probability += 0.10;
        }
        
        // Adjust for high quantity (complex orders)
        if (features.quantity > 50) {
            probability += 0.05;
        } else if (features.quantity > 100) {
            probability += 0.10;
        }
        
        // Cap at 0.99
        return Math.min(probability, 0.99);
    }
    
    /**
     * Adjust probability based on historical department performance
     */
    adjustWithHistoricalData(baseProbability, features, historicalData) {
        if (!historicalData || historicalData.length === 0) {
            return baseProbability;
        }
        
        // Filter historical data for same department
        const deptData = historicalData.filter(
            h => h.departmentCode === features.departmentCode
        );
        
        if (deptData.length < 3) {
            return baseProbability;
        }
        
        // Calculate department delay rate
        const delayedCount = deptData.filter(h => {
            const age = h.PR_Age_Days || 0;
            const sla = h.slaDays || 5;
            return age > sla;
        }).length;
        
        const delayRate = delayedCount / deptData.length;
        
        // Calculate average approval cycle for department
        const approvalCycles = deptData
            .filter(h => h.Approval_Cycle_Days > 0)
            .map(h => h.Approval_Cycle_Days);
        
        let adjustment = 0;
        
        if (approvalCycles.length > 0) {
            const avgCycle = stats.mean(approvalCycles);
            const stdDev = approvalCycles.length > 1 ? 
                stats.standardDeviation(approvalCycles) : 0;
            
            // If department has high delay rate, increase probability
            if (delayRate > 0.5) {
                adjustment += 0.15;
            } else if (delayRate > 0.3) {
                adjustment += 0.10;
            }
            
            // If average cycle is close to or exceeds SLA, increase probability
            if (avgCycle >= features.slaDays * 0.9) {
                adjustment += 0.10;
            }
            
            // If high variance in approval times, increase uncertainty
            if (stdDev > features.slaDays * 0.3) {
                adjustment += 0.05;
            }
        }
        
        return Math.min(baseProbability + adjustment, 0.99);
    }
    
    /**
     * Calculate confidence score for the prediction
     */
    calculateConfidence(features, historicalData) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on age (more data = more certain)
        if (features.ageRatio > 0.8) {
            confidence += 0.3;
        } else if (features.ageRatio > 0.5) {
            confidence += 0.2;
        } else {
            confidence += 0.1;
        }
        
        // Increase confidence if we have historical data
        if (historicalData && historicalData.length > 0) {
            const deptData = historicalData.filter(
                h => h.departmentCode === features.departmentCode
            );
            
            if (deptData.length >= 10) {
                confidence += 0.2;
            } else if (deptData.length >= 5) {
                confidence += 0.15;
            } else if (deptData.length >= 3) {
                confidence += 0.10;
            }
        }
        
        return Math.min(confidence, 0.95);
    }
    
    /**
     * Determine risk level based on probability
     */
    determineRiskLevel(probability) {
        if (probability >= 0.75) {
            return 'Critical';
        } else if (probability >= 0.50) {
            return 'High';
        } else if (probability >= 0.25) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }
    
    /**
     * Identify key factors contributing to the prediction
     */
    identifyKeyFactors(features, probability) {
        const factors = [];
        
        if (features.ageRatio >= 0.9) {
            factors.push({
                factor: 'Age',
                impact: 'Critical',
                description: `PR is ${Math.round(features.ageRatio * 100)}% through SLA period`
            });
        } else if (features.ageRatio >= 0.6) {
            factors.push({
                factor: 'Age',
                impact: 'High',
                description: `PR is ${Math.round(features.ageRatio * 100)}% through SLA period`
            });
        }
        
        if (features.isPending) {
            factors.push({
                factor: 'Status',
                impact: 'Medium',
                description: 'PR is still pending approval'
            });
        }
        
        if (features.quantity > 50) {
            factors.push({
                factor: 'Complexity',
                impact: 'Low',
                description: 'High quantity order may require additional review'
            });
        }
        
        return factors;
    }
    
    /**
     * Batch predict for multiple PRs
     */
    batchPredict(prs, historicalData = []) {
        return prs.map(pr => ({
            PRNumber: pr.PRNumber,
            PRItem: pr.PRItem,
            prediction: this.predictSLABreach(pr, historicalData)
        }));
    }
}

module.exports = new MLPredictor();

// Made with Bob
