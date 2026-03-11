import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Template } from '../types';
import TemplateCard from './TemplateCard';
import { Colors } from '../constants/colors';

interface CategorySectionProps {
  title: string;
  templates: Template[];
  onTemplatePress: (template: Template) => void;
  onSeeAll?: () => void;
  shouldPlayVideos?: boolean;
}

export default function CategorySection({
  title,
  templates,
  onTemplatePress,
  onSeeAll,
  shouldPlayVideos = true,
}: CategorySectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TemplateCard template={item} onPress={onTemplatePress} shouldPlay={shouldPlayVideos} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        removeClippedSubviews={true}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  seeAll: {
    color: Colors.purple,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingLeft: 20,
    paddingRight: 8,
  },
});
