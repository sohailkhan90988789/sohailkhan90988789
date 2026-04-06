"""
Insight Generation Service
Generates human-readable, explainable insights from detected patterns
"""

from typing import List, Dict, Any
import random


class InsightGenerator:
    """
    Generates explainable insights with recommendations
    """
    
    def __init__(self):
        self.importance_levels = {
            'high': {'min_score': 7, 'label': 'high'},
            'medium': {'min_score': 4, 'label': 'medium'},
            'low': {'min_score': 0, 'label': 'low'}
        }
    
    def generate_insights(self, patterns: List[Dict[str, Any]], 
                         processed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate insights from detected patterns
        """
        insights = []
        
        for pattern in patterns[:10]:  # Limit to top 10 patterns
            insight = self._pattern_to_insight(pattern, processed_data)
            if insight:
                insights.append(insight)
        
        return insights
    
    def _pattern_to_insight(self, pattern: Dict[str, Any], 
                           processed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert a pattern into an explainable insight"""
        
        pattern_type = pattern.get('type')
        
        if pattern_type == 'trend':
            return self._generate_trend_insight(pattern, processed_data)
        elif pattern_type == 'anomaly':
            return self._generate_anomaly_insight(pattern, processed_data)
        elif pattern_type == 'correlation':
            return self._generate_correlation_insight(pattern, processed_data)
        elif pattern_type == 'recurring':
            return self._generate_recurring_insight(pattern, processed_data)
        
        return None
    
    def _generate_trend_insight(self, pattern: Dict[str, Any], 
                               data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insight for trend patterns"""
        metric = pattern['metric']
        direction = pattern['direction']
        change_pct = abs(pattern.get('change_percentage', 0))
        
        metric_labels = {
            'sleepQuality': 'Sleep Quality',
            'moodScore': 'Mood Score',
            'stressLevel': 'Stress Level',
            'socialInteraction': 'Social Interaction',
            'physicalActivity': 'Physical Activity',
            'productivityScore': 'Productivity'
        }
        
        metric_label = metric_labels.get(metric, metric)
        
        # Create title
        if direction == 'declining':
            title = f"Declining {metric_label} Detected"
        else:
            title = f"Increasing {metric_label} Trend"
        
        # Create description
        description = f"Your {metric_label.lower()} has {direction} by {change_pct:.1f}% over the past {pattern['duration_days']} days."
        
        # Add context from correlations
        if 'correlations' in data:
            related_metrics = self._find_correlated_metrics(metric, data['correlations'], threshold=0.6)
            if related_metrics:
                description += f" This pattern correlates with changes in {', '.join(related_metrics)}."
        
        # Generate factors
        factors = [
            f"{metric_label}: {direction} ({change_pct:.1f}% change)",
            f"Trend strength: {pattern['confidence'] * 100:.0f}%",
            f"Pattern duration: {pattern['duration_days']} days"
        ]
        
        # Generate recommendation
        recommendation = self._get_recommendation_for_metric(metric, direction)
        
        # Determine importance
        importance = self._calculate_importance(pattern['importance_score'])
        
        return {
            'id': f"trend_{metric}_{random.randint(1000, 9999)}",
            'category': f'{metric_label} Pattern',
            'title': title,
            'description': description,
            'confidence': pattern['confidence'],
            'importance': importance,
            'factors': factors,
            'recommendation': recommendation,
            'pattern_type': 'trend',
            'metric': metric
        }
    
    def _generate_anomaly_insight(self, pattern: Dict[str, Any], 
                                  data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insight for anomaly patterns"""
        metric = pattern['metric']
        deviation_pct = abs(pattern.get('deviation_percentage', 0))
        
        metric_labels = {
            'sleepQuality': 'Sleep Quality',
            'moodScore': 'Mood Score',
            'stressLevel': 'Stress Level',
            'socialInteraction': 'Social Interaction',
            'physicalActivity': 'Physical Activity',
            'productivityScore': 'Productivity'
        }
        
        metric_label = metric_labels.get(metric, metric)
        
        title = f"Unusual {metric_label} Pattern"
        description = f"Recent {metric_label.lower()} levels deviate {deviation_pct:.1f}% from your baseline, suggesting a significant change in this behavioral dimension."
        
        factors = [
            f"Baseline average: {pattern['baseline_mean']:.1f}",
            f"Recent average: {pattern['recent_mean']:.1f}",
            f"Deviation: {deviation_pct:.1f}%",
            f"Statistical significance: {pattern['z_score']:.2f} σ"
        ]
        
        recommendation = self._get_recommendation_for_anomaly(metric, pattern['recent_mean'], pattern['baseline_mean'])
        
        importance = self._calculate_importance(pattern['importance_score'])
        
        return {
            'id': f"anomaly_{metric}_{random.randint(1000, 9999)}",
            'category': f'{metric_label} Anomaly',
            'title': title,
            'description': description,
            'confidence': pattern['confidence'],
            'importance': importance,
            'factors': factors,
            'recommendation': recommendation,
            'pattern_type': 'anomaly',
            'metric': metric
        }
    
    def _generate_correlation_insight(self, pattern: Dict[str, Any], 
                                      data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insight for correlation patterns"""
        metrics = pattern['metrics']
        corr_value = pattern['correlation_value']
        corr_type = pattern['correlation_type']
        
        metric_labels = {
            'sleepQuality': 'Sleep Quality',
            'moodScore': 'Mood Score',
            'stressLevel': 'Stress Level',
            'socialInteraction': 'Social Interaction',
            'physicalActivity': 'Physical Activity',
            'productivityScore': 'Productivity'
        }
        
        metric1_label = metric_labels.get(metrics[0], metrics[0])
        metric2_label = metric_labels.get(metrics[1], metrics[1])
        
        if corr_type == 'positive':
            title = f"Strong Connection: {metric1_label} & {metric2_label}"
            description = f"{metric1_label} and {metric2_label} show a strong positive correlation ({corr_value:.2f}), meaning they tend to move together."
        else:
            title = f"Inverse Relationship: {metric1_label} & {metric2_label}"
            description = f"{metric1_label} and {metric2_label} show a strong negative correlation ({corr_value:.2f}), meaning they move in opposite directions."
        
        factors = [
            f"Correlation coefficient: {corr_value:.3f}",
            f"Relationship type: {corr_type}",
            f"Statistical strength: {abs(corr_value) * 100:.0f}%"
        ]
        
        recommendation = f"Understanding this relationship can help you identify which behaviors most influence your {metric2_label.lower()}. Consider tracking both metrics closely."
        
        importance = self._calculate_importance(pattern['importance_score'])
        
        return {
            'id': f"correlation_{metrics[0]}_{metrics[1]}_{random.randint(1000, 9999)}",
            'category': 'Behavioral Correlation',
            'title': title,
            'description': description,
            'confidence': pattern['confidence'],
            'importance': importance,
            'factors': factors,
            'recommendation': recommendation,
            'pattern_type': 'correlation',
            'metrics': metrics
        }
    
    def _generate_recurring_insight(self, pattern: Dict[str, Any], 
                                   data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insight for recurring patterns"""
        metric = pattern['metric']
        
        metric_labels = {
            'sleepQuality': 'Sleep Quality',
            'moodScore': 'Mood Score',
            'stressLevel': 'Stress Level'
        }
        
        metric_label = metric_labels.get(metric, metric)
        
        title = f"Weekly Pattern in {metric_label}"
        description = f"Your {metric_label.lower()} shows a recurring weekly pattern, suggesting consistent behavioral cycles."
        
        factors = [
            f"Pattern type: Weekly cycle",
            f"Pattern strength: {pattern['confidence'] * 100:.0f}%",
            f"Affected metric: {metric_label}"
        ]
        
        recommendation = "Identifying weekly patterns can help you anticipate and prepare for predictable changes in your well-being."
        
        importance = 'medium'
        
        return {
            'id': f"recurring_{metric}_{random.randint(1000, 9999)}",
            'category': 'Recurring Pattern',
            'title': title,
            'description': description,
            'confidence': pattern['confidence'],
            'importance': importance,
            'factors': factors,
            'recommendation': recommendation,
            'pattern_type': 'recurring',
            'metric': metric
        }
    
    def _find_correlated_metrics(self, metric: str, correlations: Dict, 
                                threshold: float = 0.6) -> List[str]:
        """Find metrics strongly correlated with the given metric"""
        if metric not in correlations:
            return []
        
        related = []
        for other_metric, corr_value in correlations[metric].items():
            if other_metric != metric and abs(corr_value) >= threshold:
                related.append(other_metric)
        
        return related[:2]  # Return top 2
    
    def _get_recommendation_for_metric(self, metric: str, direction: str) -> str:
        """Get evidence-based recommendation for a metric trend"""
        recommendations = {
            'sleepQuality': {
                'declining': "Consider establishing a consistent sleep schedule. Research shows regular bedtime routines significantly improve sleep quality and overall well-being.",
                'increasing': "Great progress! Continue maintaining your sleep hygiene practices. Quality sleep is fundamental to mental and physical health."
            },
            'moodScore': {
                'declining': "Mood changes can signal the need for self-care. Consider activities that boost well-being: physical exercise, social connection, or mindfulness practices.",
                'increasing': "Positive trend! Continue engaging in activities that support your mood. Maintaining these patterns can help sustain well-being."
            },
            'stressLevel': {
                'declining': "Excellent stress management! Continue practices that help you manage stress effectively.",
                'increasing': "Elevated stress levels detected. Consider stress-reduction techniques: deep breathing, physical activity, or talking with someone you trust."
            },
            'socialInteraction': {
                'declining': "Social connections are vital for mental health. Consider scheduling regular interactions with friends, family, or community groups.",
                'increasing': "Strong social engagement! Maintaining connections is one of the most protective factors for mental well-being."
            },
            'physicalActivity': {
                'declining': "Physical activity has proven mental health benefits. Even 15-20 minutes of daily movement can significantly impact mood and stress levels.",
                'increasing': "Great activity levels! Regular physical activity is strongly associated with improved mood and reduced anxiety."
            },
            'productivityScore': {
                'declining': "Productivity changes may reflect stress or burnout. Consider breaking tasks into smaller steps and taking regular breaks.",
                'increasing': "Strong productivity! Remember to balance achievement with rest and recovery."
            }
        }
        
        return recommendations.get(metric, {}).get(direction, "Continue monitoring this metric for changes.")
    
    def _get_recommendation_for_anomaly(self, metric: str, recent: float, baseline: float) -> str:
        """Get recommendation for anomalous patterns"""
        if recent < baseline:
            return self._get_recommendation_for_metric(metric, 'declining')
        else:
            # For stress, increasing is bad
            if metric == 'stressLevel':
                return self._get_recommendation_for_metric(metric, 'increasing')
            return self._get_recommendation_for_metric(metric, 'increasing')
    
    def _calculate_importance(self, score: float) -> str:
        """Calculate importance level from score"""
        if score >= 7:
            return 'high'
        elif score >= 4:
            return 'medium'
        else:
            return 'low'
