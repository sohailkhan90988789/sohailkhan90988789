"""
Data Processing Service
Processes and prepares behavioral data for analysis
"""

import math
from typing import Any, Dict, List

import numpy as np
import pandas as pd


class DataProcessor:
    """
    Processes behavioral data and calculates metrics
    """
    
    def process(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process raw behavioral data into structured format for analysis
        """
        if not raw_data:
            return {}
        
        # Convert to pandas DataFrame for easier processing
        df = pd.DataFrame(raw_data)
        
        # Ensure date column is datetime
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
        
        # Extract timeseries data
        metrics = ['sleepHours', 'sleepQuality', 'physicalActivity', 'socialInteraction',
                   'screenTime', 'moodScore', 'stressLevel', 'productivityScore']
        
        timeseries = {}
        for metric in metrics:
            if metric in df.columns:
                timeseries[metric] = df[metric].tolist()
        
        # Calculate statistics
        statistics = self._calculate_statistics(df, metrics)
        
        # Calculate correlations
        correlations = self.calculate_correlations(raw_data)
        
        # Calculate baselines (average of first week or first 7 days)
        baselines = self._calculate_baselines(df, metrics)
        
        # Calculate recent averages (last 7 days)
        recent_averages = self._calculate_recent_averages(df, metrics)
        
        # Calculate changes
        changes = {}
        for metric in metrics:
            if metric in baselines and metric in recent_averages:
                baseline = baselines[metric]
                recent = recent_averages[metric]
                if baseline > 0:
                    changes[metric] = ((recent - baseline) / baseline) * 100
                else:
                    changes[metric] = 0
        
        return {
            'timeseries': timeseries,
            'statistics': statistics,
            'correlations': correlations,
            'baselines': baselines,
            'recent_averages': recent_averages,
            'changes': changes,
            'data_points': len(raw_data),
            'date_range': {
                'start': df['date'].min().isoformat() if 'date' in df.columns else None,
                'end': df['date'].max().isoformat() if 'date' in df.columns else None
            }
        }
    
    def _calculate_statistics(self, df: pd.DataFrame, metrics: List[str]) -> Dict[str, Any]:
        """Calculate basic statistics for each metric"""
        stats = {}
        
        for metric in metrics:
            if metric in df.columns:
                stats[metric] = {
                    'mean': float(df[metric].mean()),
                    'median': float(df[metric].median()),
                    'std': float(df[metric].std()),
                    'min': float(df[metric].min()),
                    'max': float(df[metric].max()),
                    'q25': float(df[metric].quantile(0.25)),
                    'q75': float(df[metric].quantile(0.75))
                }
        
        return stats
    
    def calculate_correlations(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Calculate Pearson correlations between all metrics"""
        if not raw_data:
            return {}
        
        df = pd.DataFrame(raw_data)
        
        metrics = ['sleepQuality', 'moodScore', 'stressLevel', 'socialInteraction',
                   'physicalActivity', 'productivityScore']
        
        # Filter to only existing metrics
        available_metrics = [m for m in metrics if m in df.columns]
        
        if len(available_metrics) < 2:
            return {}
        
        # Calculate correlation matrix
        corr_matrix = df[available_metrics].corr()
        
        # Convert to nested dictionary
        correlations = {}
        for metric1 in available_metrics:
            correlations[metric1] = {}
            for metric2 in available_metrics:
                correlations[metric1][metric2] = self._normalize_correlation_value(
                    corr_matrix.loc[metric1, metric2],
                    default=1.0 if metric1 == metric2 else 0.0,
                )

        return correlations
    
    def _calculate_baselines(self, df: pd.DataFrame, metrics: List[str]) -> Dict[str, float]:
        """Calculate baseline values (first 7 days average)"""
        baselines = {}
        
        baseline_df = df.head(min(7, len(df)))
        
        for metric in metrics:
            if metric in baseline_df.columns:
                baselines[metric] = float(baseline_df[metric].mean())
        
        return baselines
    
    def _calculate_recent_averages(self, df: pd.DataFrame, metrics: List[str]) -> Dict[str, float]:
        """Calculate recent averages (last 7 days)"""
        recent = {}
        
        recent_df = df.tail(min(7, len(df)))
        
        for metric in metrics:
            if metric in recent_df.columns:
                recent[metric] = float(recent_df[metric].mean())
        
        return recent
    
    def analyze_trends(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trends over time"""
        if not raw_data:
            return {}
        
        df = pd.DataFrame(raw_data)
        
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
        
        metrics = ['sleepQuality', 'moodScore', 'stressLevel', 'socialInteraction',
                   'physicalActivity', 'productivityScore']
        
        trends = {}
        
        for metric in metrics:
            if metric not in df.columns:
                continue
            
            values = df[metric].values
            x = np.arange(len(values))
            
            # Linear regression
            if len(values) >= 2:
                slope = self._calculate_slope(x, values)
                
                trends[metric] = {
                    'slope': float(slope),
                    'direction': 'increasing' if slope > 0.05 else ('decreasing' if slope < -0.05 else 'stable'),
                    'current_value': float(values[-1]),
                    'change_from_start': float(values[-1] - values[0]),
                    'percent_change': float(((values[-1] - values[0]) / values[0] * 100) if values[0] != 0 else 0)
                }
        
        return trends
    
    def _calculate_slope(self, x: np.ndarray, y: np.ndarray) -> float:
        """Calculate slope using linear regression"""
        n = len(x)
        if n < 2:
            return 0.0
        
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        
        numerator = np.sum((x - x_mean) * (y - y_mean))
        denominator = np.sum((x - x_mean) ** 2)
        
        if denominator == 0:
            return 0.0

        return numerator / denominator

    def _normalize_correlation_value(self, value: Any, default: float = 0.0) -> float:
        """Return a JSON-safe correlation coefficient."""
        try:
            numeric_value = float(value)
        except (TypeError, ValueError):
            return default

        if not math.isfinite(numeric_value):
            return default

        return max(-1.0, min(1.0, numeric_value))
