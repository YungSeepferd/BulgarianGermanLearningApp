"""
Learning Progression Optimization Tool
Optimizes vocabulary learning paths based on CEFR levels and dependencies.
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, List, Set, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class LearningUnit:
    terms: List[Dict[str, str]]
    level: str
    prerequisites: List[str]
    focus_area: str
    estimated_time: int  # minutes
    review_points: List[str]

@dataclass
class ProgressionPath:
    units: List[LearningUnit]
    total_duration: int
    review_schedule: List[Dict[str, List[str]]]
    skill_building_order: List[str]

class ProgressionOptimizer:
    def __init__(self):
        self.vocabulary_data = None
        self.dependency_graph = defaultdict(set)
        self.level_mapping = {
            'A1': 1,
            'A2': 2,
            'B1': 3,
            'B2': 4,
            'C1': 5,
            'C2': 6
        }
        
    def load_data(self, file_path: str) -> None:
        """Load vocabulary data from JSON file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            self.vocabulary_data = json.load(f)
            
    def build_dependency_graph(self) -> None:
        """Build graph of term dependencies."""
        vocabulary = self.vocabulary_data['vocabulary']
        
        # Map terms to their levels
        term_levels = {
            entry['bg']: entry.get('level', 'A1')
            for entry in vocabulary
        }
        
        # Find dependencies based on:
        # 1. CEFR level progression
        # 2. Semantic relationships
        # 3. Usage patterns
        for entry in vocabulary:
            term = entry['bg']
            level = entry.get('level', 'A1')
            
            # Add level-based dependencies
            level_num = self.level_mapping[level]
            if level_num > 1:
                # Find terms from previous level that should be prerequisites
                prev_level = [k for k, v in term_levels.items() 
                            if self.level_mapping[v] == level_num - 1]
                            
                # Add relevant prerequisites
                for prev_term in prev_level:
                    if self._are_related(term, prev_term):
                        self.dependency_graph[term].add(prev_term)
                        
            # Add semantic dependencies
            for other in vocabulary:
                if other['bg'] != term:
                    if self._are_semantically_dependent(entry, other):
                        self.dependency_graph[term].add(other['bg'])
    
    def _are_related(self, term1: str, term2: str) -> bool:
        """Check if two terms are related (share tags or contexts)."""
        entry1 = next(e for e in self.vocabulary_data['vocabulary'] if e['bg'] == term1)
        entry2 = next(e for e in self.vocabulary_data['vocabulary'] if e['bg'] == term2)
        
        # Check for shared tags
        tags1 = set(entry1.get('tags', []))
        tags2 = set(entry2.get('tags', []))
        if tags1 & tags2:
            return True
            
        # Check for shared contexts in examples
        contexts1 = {ex.get('context') for ex in entry1.get('examples', [])}
        contexts2 = {ex.get('context') for ex in entry2.get('examples', [])}
        if contexts1 & contexts2:
            return True
            
        return False
    
    def _are_semantically_dependent(self, entry1: Dict, entry2: Dict) -> bool:
        """Check if terms have a semantic dependency relationship."""
        # Check if terms are related forms
        if entry1.get('related_forms', []) and entry2['bg'] in entry1['related_forms']:
            return True
            
        # Check if one is part of the other's semantic field
        if set(entry1.get('tags', [])) & set(entry2.get('semantic_field', [])):
            return True
            
        return False
        
    def create_learning_units(self) -> List[LearningUnit]:
        """Create optimized learning units."""
        vocabulary = self.vocabulary_data['vocabulary']
        units = []
        
        # Group terms by level
        level_terms = defaultdict(list)
        for entry in vocabulary:
            level_terms[entry.get('level', 'A1')].append(entry)
            
        # Create units for each level
        for level in ['A1', 'A2', 'B1', 'B2']:
            terms = level_terms[level]
            
            # Group terms by focus area (tags)
            focus_groups = defaultdict(list)
            for term in terms:
                for tag in term.get('tags', ['general']):
                    focus_groups[tag].append(term)
                    
            # Create units for each focus area
            for focus, focus_terms in focus_groups.items():
                # Skip if too few terms
                if len(focus_terms) < 3:
                    continue
                    
                # Find prerequisites
                prereqs = set()
                for term in focus_terms:
                    prereqs.update(self.dependency_graph[term['bg']])
                    
                # Create review points
                review = [
                    f"Practice {focus} vocabulary",
                    f"Use terms in {focus} contexts",
                    "Review related grammar points"
                ]
                
                units.append(LearningUnit(
                    terms=focus_terms,
                    level=level,
                    prerequisites=list(prereqs),
                    focus_area=focus,
                    estimated_time=30,  # Default 30 minutes
                    review_points=review
                ))
                
        return units
        
    def optimize_progression(self) -> ProgressionPath:
        """Create optimized learning progression."""
        # Build dependency graph if not already built
        if not self.dependency_graph:
            self.build_dependency_graph()
            
        # Create learning units
        units = self.create_learning_units()
        
        # Sort units by level and dependencies
        sorted_units = self._topological_sort(units)
        
        # Create review schedule
        review_schedule = self._create_review_schedule(sorted_units)
        
        # Determine skill building order
        skill_order = self._determine_skill_order(sorted_units)
        
        # Calculate total duration
        total_time = sum(unit.estimated_time for unit in sorted_units)
        
        return ProgressionPath(
            units=sorted_units,
            total_duration=total_time,
            review_schedule=review_schedule,
            skill_building_order=skill_order
        )
        
    def _topological_sort(self, units: List[LearningUnit]) -> List[LearningUnit]:
        """Sort units based on dependencies."""
        # Create adjacency list for units
        adj_list = defaultdict(set)
        for i, unit in enumerate(units):
            for j, other in enumerate(units):
                if i != j and any(term in unit.prerequisites 
                                for term in [t['bg'] for t in other.terms]):
                    adj_list[i].add(j)
                    
        # Perform topological sort
        visited = set()
        temp = set()
        order = []
        
        def visit(i):
            if i in temp:
                raise ValueError("Cyclic dependency detected")
            if i in visited:
                return
            temp.add(i)
            for j in adj_list[i]:
                visit(j)
            temp.remove(i)
            visited.add(i)
            order.append(i)
            
        for i in range(len(units)):
            if i not in visited:
                visit(i)
                
        # Return units in sorted order
        return [units[i] for i in reversed(order)]
        
    def _create_review_schedule(self, units: List[LearningUnit]) -> List[Dict[str, List[str]]]:
        """Create spaced repetition review schedule."""
        schedule = []
        
        # Create review points after 1 day, 3 days, 1 week, 2 weeks
        intervals = [1, 3, 7, 14]  # days
        
        for unit in units:
            reviews = {}
            current_day = 0
            
            for interval in intervals:
                current_day += interval
                reviews[f"day_{current_day}"] = [
                    f"Review {unit.focus_area} vocabulary",
                    f"Practice with exercises",
                    "Check retention"
                ]
                
            schedule.append(reviews)
            
        return schedule
        
    def _determine_skill_order(self, units: List[LearningUnit]) -> List[str]:
        """Determine optimal order for building language skills."""
        # Basic skill progression
        core_skills = [
            "essential_vocabulary",
            "basic_grammar",
            "listening_comprehension",
            "speaking_practice",
            "reading_skills",
            "writing_ability"
        ]
        
        # Add focus-area specific skills
        focus_areas = {unit.focus_area for unit in units}
        skill_order = core_skills + [f"{focus}_mastery" for focus in focus_areas]
        
        return skill_order
        
    def export_progression(self, output_path: str) -> None:
        """Export progression analysis to JSON."""
        progression = self.optimize_progression()
        
        analysis = {
            "learning_path": {
                "units": [
                    {
                        "level": unit.level,
                        "focus_area": unit.focus_area,
                        "terms": unit.terms,
                        "prerequisites": unit.prerequisites,
                        "estimated_time": unit.estimated_time,
                        "review_points": unit.review_points
                    }
                    for unit in progression.units
                ],
                "total_duration": progression.total_duration,
                "review_schedule": progression.review_schedule,
                "skill_building_order": progression.skill_building_order
            }
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)

def main(input_path: str, output_path: str):
    """Main function to run progression optimization."""
    optimizer = ProgressionOptimizer()
    optimizer.load_data(input_path)
    optimizer.export_progression(output_path)

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 3:
        print("Usage: python progression.py input.json output.json")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])