import SwiftUI

/// A button that toggles the learning direction and updates the UI instantly.
struct DirectionToggle: View {
    @AppStorage("learningDirection") private var learningDirection: LearningDirection = .bulgarianToGerman

    var body: some View {
        Button(action: {
            learningDirection = learningDirection == .bulgarianToGerman ? .germanToBulgarian : .bulgarianToGerman
        }) {
            Text(learningDirection.toggleLabel)
                .font(.caption)
                .padding(6)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(6)
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityLabel(learningDirection.toggleAccessibilityLabel)
    }
}
