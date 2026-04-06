"""
Pattern Detection Service
Uses machine learning algorithms to detect behavioral patterns
"""

import math
from typing import Any, Dict, List

import numpy as np


class PatternDetector:
    """
    Detects behavioral patterns using statistical and ML methods
    """
    
    def __init__(self):
        self.confidence_threshold = 0.70
        self.min_pattern_length = 7  # Minimum days to detect a pattern
    
    def detect_patterns(self, processed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Main pattern detection method
        Returns list of detected patterns with confidence scores
        """
        patterns = []
        
        # Detect trend patterns
        trend_patterns = self._detect_trends(processed_data)
        patterns.extend(trend_patterns)
        
        # Detect anomalies
        anomaly_patterns = self._detect_anomalies(processed_data)
        patterns.extend(anomaly_patterns)
        
        # Detect correlations
        correlation_patterns = self._detect_correlations(processed_data)
        patterns.extend(correlation_patterns)
        
        # Detect recurring patterns
        recurring_patterns = self._detect_recurring_patterns(processed_data)
        patterns.extend(recurring_patterns)
        
        # Filter by confidence threshold
        patterns = [p for p in patterns if p['confidence'] >= self.confidence_threshold]
        
        # Sort by importance
        patterns.sort(key=lambda x: (x['importance_score'], x['confidence']), reverse=True)
        
        return patterns
    
    def _detect_trends(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect upward or downward trends in metrics"""
        patterns = []
        metrics = ['sleepQuality', 'moodScore', 'stressLevel', 'socialInteraction', 
                   'physicalActivity', 'productivityScore']
        
        for metric in metrics:
            if metric not in data['timeseries']:
                continue
            
            values = data['timeseries'][metric]
            if len(values) < self.min_pattern_length:
                continue
            
            # Calculate trend using linear regression
            x = np.arange(len(values))
            y = np.array(values)
            
            # Simple linear regression
            slope = self._calculate_slope(x, y)
            r_squared = self._calculate_r_squared(x, y, slope)
            
            # Determine if trend is significant
            if abs(slope) > 0.05 and r_squared > 0.5:
                direction = 'declining' if slope < 0 else 'increasing'
                
                # For stress, declining is good; for others, increasing is good
                is_concerning = (metric == 'stressLevel' and direction == 'increasing') or \
                               (metric != 'stressLevel' and direction == 'declining')
                
                patterns.append({
                    'type': 'trend',
                    'metric': metric,
                    'direction': direction,
                    'slope': float(slope),
                    'confidence': float(r_squared),
                    'importance_score': abs(slope) * r_squared * 10,
                    'is_concerning': is_concerning,
                    'duration_days': len(values),
                    'change_percentage': self._safe_percent_change(
                        np.mean(y),
                        slope * len(values),
                    ),
                })
        
        return patterns
    
    def _detect_anomalies(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect anomalous behavioral patterns using Z-score"""
        patterns = []
        metrics = ['sleepQuality', 'moodScore', 'stressLevel', 'socialInteraction', 
                   'physicalActivity', 'productivityScore']
        
        for metric in metrics:
            if metric not in data['timeseries']:
                continue
            
            values = data['timeseries'][metric]
            if len(values) < self.min_pattern_length:
                continue
            
            mean = np.mean(values)
            std = np.std(values)
            
            # Recent window (last 7 days)
            recent_values = values[-7:]
            recent_mean = np.mean(recent_values)
            
            # Calculate Z-score for recent period
            if std > 0:
                z_score = abs((recent_mean - mean) / std)
                
                if z_score > 1.5:  # Significant deviation
                    patterns.append({
                        'type': 'anomaly',
                        'metric': metric,
                        'z_score': float(z_score),
                        'baseline_mean': float(mean),
                        'recent_mean': float(recent_mean),
                        'confidence': min(z_score / 3, 1.0),  # Normalize to 0-1
                        'importance_score': z_score * 2,
                        'is_concerning': z_score > 2.0,
                        'deviation_percentage': self._safe_percent_change(
                            mean,
                            recent_mean - mean,
                        ),
                    })
        
        return patterns
    
    def _detect_correlations(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect strong correlations between metrics"""
        patterns = []
        
        if 'correlations' not in data:
            return patterns
        
        correlations = data['correlations']
        
        # Check for strong correlations
        strong_correlations = []
        for metric1, corr_dict in correlations.items():
            for metric2, corr_value in corr_dict.items():
                if metric1 < metric2:  # Avoid duplicates
                    if abs(corr_value) > 0.6:  # Strong correlation
                        strong_correlations.append({
                            'metric1': metric1,
                            'metric2': metric2,
                            'correlation': corr_value
                        })
        
        for corr in strong_correlations:
            patterns.append({
                'type': 'correlation',
                'metrics': [corr['metric1'], corr['metric2']],
                'correlation_value': float(corr['correlation']),
                'correlation_type': 'positive' if corr['correlation'] > 0 else 'negative',
                'confidence': abs(corr['correlation']),
                'importance_score': abs(corr['correlation']) * 3,
                'is_concerning': False  # Correlations themselves aren't concerning
            })
        
        return patterns
    
    def _detect_recurring_patterns(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect recurring weekly patterns"""
        patterns = []
        
        # Check if there's a weekly cycle in stress or mood
        for metric in ['stressLevel', 'moodScore']:
            if metric not in data['timeseries']:
                continue
            
            values = data['timeseries'][metric]
            if len(values) < 14:  # Need at least 2 weeks
                continue
            
            # Simple weekly pattern detection
            # Compare first week vs second week correlation
            if len(values) >= 14:
                week1 = values[:7]
                week2 = values[7:14]

                if np.std(week1) == 0 or np.std(week2) == 0:
                    continue

                correlation = np.corrcoef(week1, week2)[0, 1]
                if not math.isfinite(float(correlation)):
                    continue
                
                if abs(correlation) > 0.6:
                    patterns.append({
                        'type': 'recurring',
                        'metric': metric,
                        'pattern': 'weekly',
                        'correlation': float(correlation),
                        'confidence': abs(correlation),
                        'importance_score': abs(correlation) * 2,
                        'is_concerning': False
                    })
        
        return patterns
    
    def _calculate_slope(self, x: np.ndarray, y: np.ndarray) -> float:
        """Calculate slope for linear regression"""
        n = len(x)
        slope = (n * np.sum(x * y) - np.sum(x) * np.sum(y)) / \
                (n * np.sum(x ** 2) - np.sum(x) ** 2)
        return slope
    
    def _calculate_r_squared(self, x: np.ndarray, y: np.ndarray, slope: float) -> float:
        """Calculate R-squared value"""
        intercept = np.mean(y) - slope * np.mean(x)
        y_pred = slope * x + intercept
        
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        return max(0, min(1, r_squared))  # Clamp to [0, 1]

    def _safe_percent_change(self, baseline: float, delta: float) -> float:
        """Calculate percent change while avoiding infinities and NaN."""
        if baseline == 0:
            return 0.0

        value = (delta / baseline) * 100
        return float(value) if math.isfinite(float(value)) else 0.0
