import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  useBudget,
} from '@/hooks/use-budget';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BudgetScreen() {
  const {
    monthlyBudget,
    setMonthlyBudget,
    addExpense,
    deleteExpense,
    getCurrentMonthExpenses,
    getCurrentMonthTotal,
    getCategoryTotals,
    getTopSpendingCategory,
    isLoading,
  } = useBudget();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Other');
  const [expenseTag, setExpenseTag] = useState('');
  const [budgetInput, setBudgetInput] = useState('');

  const currentTotal = getCurrentMonthTotal();
  const currentExpenses = getCurrentMonthExpenses();
  const categoryTotals = getCategoryTotals();
  const topCategory = getTopSpendingCategory();
  const isOverBudget = monthlyBudget > 0 && currentTotal > monthlyBudget;
  const budgetPercent = monthlyBudget > 0 ? Math.min((currentTotal / monthlyBudget) * 100, 100) : 0;
  const remaining = monthlyBudget - currentTotal;

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a) as [ExpenseCategory, number][];
  }, [categoryTotals]);

  const cutSuggestions = useMemo(() => {
    if (!isOverBudget || sortedCategories.length === 0) return [];
    const overBy = currentTotal - monthlyBudget;
    const suggestions: string[] = [];
    if (topCategory) {
      const topAmount = categoryTotals[topCategory] || 0;
      suggestions.push(
        `${topCategory} is your biggest expense at $${topAmount.toFixed(2)}. Look for ways to reduce spending here.`,
      );
    }
    if (sortedCategories.length > 1) {
      const [secondCat, secondAmt] = sortedCategories[1];
      suggestions.push(
        `Consider cutting back on ${secondCat} ($${secondAmt.toFixed(2)}) to save more.`,
      );
    }
    suggestions.push(
      `You're $${overBy.toFixed(2)} over budget. Try to reduce daily spending by $${(overBy / Math.max(1, 30 - now.getDate())).toFixed(2)} for the rest of the month.`,
    );
    return suggestions;
  }, [isOverBudget, sortedCategories, topCategory, categoryTotals, currentTotal, monthlyBudget, now]);

  const handleAddExpense = useCallback(() => {
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!expenseDesc.trim()) {
      Alert.alert('Missing Description', 'Please enter a description.');
      return;
    }
    addExpense({
      amount,
      description: expenseDesc.trim(),
      category: expenseCategory,
      tag: expenseTag.trim() || undefined,
      date: new Date().toISOString(),
    });
    setExpenseAmount('');
    setExpenseDesc('');
    setExpenseCategory('Other');
    setExpenseTag('');
    setShowAddExpense(false);
  }, [expenseAmount, expenseDesc, expenseCategory, expenseTag, addExpense]);

  const handleSetBudget = useCallback(() => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    setMonthlyBudget(amount);
    setBudgetInput('');
    setShowSetBudget(false);
  }, [budgetInput, setMonthlyBudget]);

  const handleDeleteExpense = useCallback(
    (id: string, desc: string) => {
      Alert.alert('Delete Expense', `Remove "${desc}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
      ]);
    },
    [deleteExpense],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <FreepassHeader title="Budget" showMenu showBack={false} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <FreepassTabBar activeTab="budget" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FreepassHeader title="Budget" showMenu showBack={false} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month & Budget Header */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable onPress={() => { setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : ''); setShowSetBudget(true); }}>
            <Text style={styles.editBudgetLink}>
              {monthlyBudget > 0 ? 'Edit Budget' : 'Set Budget'}
            </Text>
          </Pressable>
        </View>

        {/* Budget Overview Card */}
        <View style={[styles.overviewCard, isOverBudget && styles.overviewCardOver]}>
          <Text style={styles.overviewLabel}>Spent this month</Text>
          <Text style={[styles.overviewAmount, isOverBudget && styles.overviewAmountOver]}>
            ${currentTotal.toFixed(2)}
          </Text>
          {monthlyBudget > 0 && (
            <>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${budgetPercent}%` },
                    isOverBudget && styles.progressBarOver,
                  ]}
                />
              </View>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>
                  Budget: ${monthlyBudget.toFixed(2)}
                </Text>
                <Text style={[styles.remainingLabel, isOverBudget && styles.remainingOver]}>
                  {isOverBudget
                    ? `$${Math.abs(remaining).toFixed(2)} over`
                    : `$${remaining.toFixed(2)} left`}
                </Text>
              </View>
            </>
          )}
          {monthlyBudget === 0 && (
            <Pressable
              style={styles.setBudgetBtn}
              onPress={() => setShowSetBudget(true)}>
              <Text style={styles.setBudgetBtnText}>Set a Monthly Budget</Text>
            </Pressable>
          )}
        </View>

        {/* Over Budget Alert */}
        {isOverBudget && cutSuggestions.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={FreepassColors.destructive} />
              <Text style={styles.alertTitle}>Over Budget</Text>
            </View>
            <Text style={styles.alertSubtitle}>Tips to get back on track:</Text>
            {cutSuggestions.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Category Breakdown */}
        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            {sortedCategories.map(([cat, amount]) => {
              const pct = monthlyBudget > 0 ? (amount / monthlyBudget) * 100 : 0;
              return (
                <View key={cat} style={styles.categoryRow}>
                  <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
                  <IconSymbol
                    name={CATEGORY_ICONS[cat] as any}
                    size={18}
                    color={CATEGORY_COLORS[cat]}
                  />
                  <Text style={styles.categoryName}>{cat}</Text>
                  <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                  {monthlyBudget > 0 && (
                    <Text style={styles.categoryPct}>{pct.toFixed(0)}%</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() => setShowAddExpense(true)}>
              <IconSymbol name="plus" size={16} color={FreepassColors.white} />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
          {currentExpenses.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="chart.bar.fill" size={40} color={FreepassColors.lightGray} />
              <Text style={styles.emptyText}>No expenses yet this month.</Text>
              <Text style={styles.emptySubtext}>Tap "Add" to log your first expense.</Text>
            </View>
          )}
          {currentExpenses.map((expense) => (
            <Pressable
              key={expense.id}
              style={styles.expenseRow}
              onLongPress={() => handleDeleteExpense(expense.id, expense.description)}>
              <View style={[styles.expenseDot, { backgroundColor: CATEGORY_COLORS[expense.category] }]} />
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDesc}>{expense.description}</Text>
                <View style={styles.expenseMeta}>
                  <Text style={styles.expenseCat}>{expense.category}</Text>
                  {expense.tag && <Text style={styles.expenseTag}>#{expense.tag}</Text>}
                </View>
              </View>
              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
                <Text style={styles.expenseDate}>
                  {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        style={styles.fab}
        onPress={() => setShowAddExpense(true)}
        android_ripple={{ color: FreepassColors.primaryDark }}>
        <IconSymbol name="plus" size={28} color={FreepassColors.white} />
      </Pressable>

      {/* Add Expense Modal */}
      <Modal visible={showAddExpense} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <Pressable onPress={() => setShowAddExpense(false)} hitSlop={8}>
                <IconSymbol name="xmark" size={20} color={FreepassColors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              placeholderTextColor={FreepassColors.textSecondary}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Groceries at Aldi"
              value={expenseDesc}
              onChangeText={setExpenseDesc}
              placeholderTextColor={FreepassColors.textSecondary}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    expenseCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] },
                  ]}
                  onPress={() => setExpenseCategory(cat)}>
                  <IconSymbol
                    name={CATEGORY_ICONS[cat] as any}
                    size={14}
                    color={expenseCategory === cat ? FreepassColors.white : CATEGORY_COLORS[cat]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      expenseCategory === cat && styles.categoryChipTextActive,
                    ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Tag (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. weekly, essential"
              value={expenseTag}
              onChangeText={setExpenseTag}
              placeholderTextColor={FreepassColors.textSecondary}
            />

            <Pressable style={styles.saveBtn} onPress={handleAddExpense}>
              <Text style={styles.saveBtnText}>Save Expense</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Set Budget Modal */}
      <Modal visible={showSetBudget} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Monthly Budget</Text>
              <Pressable onPress={() => setShowSetBudget(false)} hitSlop={8}>
                <IconSymbol name="xmark" size={20} color={FreepassColors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Monthly Budget ($)</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholderTextColor={FreepassColors.textSecondary}
            />

            <Text style={styles.budgetHint}>
              Set a realistic monthly budget based on your income. You'll get alerts when you're
              close to or over your limit.
            </Text>

            <Pressable style={styles.saveBtn} onPress={handleSetBudget}>
              <Text style={styles.saveBtnText}>Save Budget</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FreepassTabBar activeTab="budget" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: FreepassColors.textSecondary },

  // Month header
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: { fontSize: 22, fontWeight: '700', color: FreepassColors.text },
  editBudgetLink: { fontSize: 14, fontWeight: '600', color: FreepassColors.accent },

  // Overview card
  overviewCard: {
    backgroundColor: FreepassColors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  overviewCardOver: { backgroundColor: '#7B1A1A' },
  overviewLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  overviewAmount: { fontSize: 36, fontWeight: '800', color: FreepassColors.white, marginBottom: 12 },
  overviewAmountOver: { color: '#FFCCCC' },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: FreepassColors.accentLight,
    borderRadius: 4,
  },
  progressBarOver: { backgroundColor: '#FF6B6B' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  remainingLabel: { fontSize: 13, fontWeight: '600', color: FreepassColors.accentLight },
  remainingOver: { color: '#FF6B6B' },
  setBudgetBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  setBudgetBtnText: { fontSize: 15, fontWeight: '600', color: FreepassColors.white },

  // Alert card
  alertCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: FreepassColors.destructive,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: FreepassColors.destructive },
  alertSubtitle: { fontSize: 13, color: FreepassColors.textSecondary, marginBottom: 8 },
  tipRow: { flexDirection: 'row', marginBottom: 4, paddingRight: 8 },
  tipBullet: { fontSize: 14, color: FreepassColors.textSecondary, marginRight: 6, marginTop: 1 },
  tipText: { fontSize: 14, color: FreepassColors.text, lineHeight: 20, flex: 1 },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Categories
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
    gap: 10,
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { flex: 1, fontSize: 15, fontWeight: '500', color: FreepassColors.text },
  categoryAmount: { fontSize: 15, fontWeight: '600', color: FreepassColors.text },
  categoryPct: { fontSize: 13, color: FreepassColors.textSecondary, width: 36, textAlign: 'right' },

  // Expenses
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
    gap: 10,
  },
  expenseDot: { width: 8, height: 8, borderRadius: 4 },
  expenseInfo: { flex: 1 },
  expenseDesc: { fontSize: 15, fontWeight: '500', color: FreepassColors.text },
  expenseMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  expenseCat: { fontSize: 12, color: FreepassColors.textSecondary },
  expenseTag: { fontSize: 12, color: FreepassColors.accent, fontWeight: '500' },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 15, fontWeight: '600', color: FreepassColors.destructive },
  expenseDate: { fontSize: 12, color: FreepassColors.textSecondary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 16, fontWeight: '600', color: FreepassColors.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 14, color: FreepassColors.textSecondary, marginTop: 4 },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: FreepassColors.white },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FreepassColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FreepassColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: FreepassColors.text },

  // Inputs
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: FreepassColors.text,
  },
  inputLarge: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: '700',
    color: FreepassColors.text,
    textAlign: 'center',
  },
  budgetHint: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },

  // Category picker
  categoryPicker: { flexDirection: 'row', marginBottom: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: FreepassColors.offWhite,
    marginRight: 8,
  },
  categoryChipText: { fontSize: 13, fontWeight: '500', color: FreepassColors.text },
  categoryChipTextActive: { color: FreepassColors.white },

  // Save button
  saveBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: FreepassColors.white },
});
